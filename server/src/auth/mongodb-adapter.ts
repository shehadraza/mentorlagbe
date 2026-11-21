
import type { Db, MongoClient, Document } from "mongodb";

import type {
  AdapterFactoryCustomizeAdapterCreator,
  CustomAdapter,
  CleanedWhere,
  JoinConfig,
} from "@better-auth/core/db/adapter";

// All Better Auth models share the same physical MongoDB collection.
const AUTH_COLLECTION = "users";
const AUTH_MODEL_FIELD = "_authModel";

const AUTH_MODELS = new Set([
  "user",
  "session",
  "account",
  "verification",
  "jwks",
]);

// Get exact parameter types from the installed Better Auth adapter interface.
type AdapterMethodArgs<K extends keyof CustomAdapter> =
  NonNullable<CustomAdapter[K]> extends (
    ...args: infer A
  ) => unknown
    ? A[0]
    : never;

function getAuthModel(model: string): string {
  const normalized = model.toLowerCase();

  if (!AUTH_MODELS.has(normalized)) {
    throw new Error(`Unsupported Better Auth model: ${model}`);
  }

  return normalized;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildCondition(condition: CleanedWhere): Document {
  const { field, value, operator, mode } = condition;

  if (field === AUTH_MODEL_FIELD) {
    throw new Error("Reserved adapter field cannot be queried directly");
  }

  switch (operator) {
    case "eq":
      return { [field]: value };

    case "ne":
      return { [field]: { $ne: value } };

    case "gt":
      return { [field]: { $gt: value } };

    case "gte":
      return { [field]: { $gte: value } };

    case "lt":
      return { [field]: { $lt: value } };

    case "lte":
      return { [field]: { $lte: value } };

    case "in":
      return { [field]: { $in: value } };

    case "not_in":
      return { [field]: { $nin: value } };

    case "contains":
    case "starts_with":
    case "ends_with": {
      if (typeof value !== "string") {
        throw new Error(`${operator} requires a string value`);
      }

      const escaped = escapeRegex(value);

      const pattern =
        operator === "starts_with"
          ? `^${escaped}`
          : operator === "ends_with"
            ? `${escaped}$`
            : escaped;

      return {
        [field]: {
          $regex: pattern,
          ...(mode === "insensitive" ? { $options: "i" } : {}),
        },
      };
    }

    default:
      throw new Error(`Unsupported Better Auth operator: ${operator}`);
  }
}

function buildFilter(
  model: string,
  where: CleanedWhere[] = [],
): Document {
  const filter: Document = {
    [AUTH_MODEL_FIELD]: getAuthModel(model),
  };

  if (where.length === 0) {
    return filter;
  }

  const conditions = where.map(buildCondition);
  const andConditions: Document[] = [];
  let orGroup: Document[] = [];

  for (let index = 0; index < conditions.length; index++) {
    if (index > 0 && where[index]?.connector === "AND") {
      if (orGroup.length === 1) {
        andConditions.push(orGroup[0]!);
      } else if (orGroup.length > 1) {
        andConditions.push({ $or: orGroup });
      }

      orGroup = [];
    }

    orGroup.push(conditions[index]!);
  }

  if (orGroup.length === 1) {
    andConditions.push(orGroup[0]!);
  } else if (orGroup.length > 1) {
    andConditions.push({ $or: orGroup });
  }

  if (andConditions.length === 1) {
    Object.assign(filter, andConditions[0]);
  } else {
    filter.$and = andConditions;
  }

  return filter;
}

function cleanDocument<T extends Document>(
  document: T | null,
): T | null {
  if (!document) {
    return null;
  }

  const result = { ...document };
  delete result[AUTH_MODEL_FIELD];

  return result as T;
}

// Build a MongoDB inclusion projection without mixing inclusion
// and exclusion fields (except MongoDB's special _id behavior).
function getProjection(
  select?: string[] | undefined,
): Document | undefined {
  if (!select?.length) {
    return undefined;
  }

  const projection: Document = {
    _id: 1,
  };

  for (const field of select) {
    if (field !== AUTH_MODEL_FIELD) {
      projection[field] = 1;
    }
  }

  return projection;
}

// Attach related Better Auth records from the same physical collection.
async function attachJoins<T extends Document>(
  collection: ReturnType<Db["collection"]>,
  document: T,
  join?: JoinConfig,
): Promise<T> {
  if (!join) {
    return document;
  }

  const result: Document = { ...document };

  for (const [relationName, config] of Object.entries(join)) {
    const relatedModel = getAuthModel(
      config.modelKey ?? relationName,
    );

    const sourceValue = result[config.on.from];
    const isOneToOne = config.relation === "one-to-one";

    if (sourceValue === undefined || sourceValue === null) {
      result[relationName] = isOneToOne ? null : [];
      continue;
    }

    // If the source field contains multiple values, match any of them.
    const relatedValueFilter = Array.isArray(sourceValue)
      ? { $in: sourceValue }
      : sourceValue;

    const filter: Document = {
      [AUTH_MODEL_FIELD]: relatedModel,
      [config.on.to]: relatedValueFilter,
    };

    const requestedLimit = config.limit ?? 100;
    const limit = isOneToOne
      ? 1
      : Math.max(1, Math.floor(requestedLimit));

    const relatedDocuments = await collection
      .find(filter)
      .limit(limit)
      .toArray();

    if (isOneToOne) {
      result[relationName] = cleanDocument(
        relatedDocuments[0] ?? null,
      );
    } else {
      result[relationName] = relatedDocuments
        .map((item) => cleanDocument(item))
        .filter((item) => item !== null);
    }
  }

  return result as T;
}

export function createMongoDBAdapter(
  database: Db,
  client: MongoClient,
): AdapterFactoryCustomizeAdapterCreator {
  // Transaction support has not been implemented.
  void client;

  return () => {
    const collection = database.collection(AUTH_COLLECTION);

    const adapter: CustomAdapter = {
      async create<T extends Record<string, any>>({
        data,
        model,
      }: AdapterMethodArgs<"create">) {
        const authModel = getAuthModel(model);

        if (AUTH_MODEL_FIELD in data) {
          throw new Error("Reserved adapter field cannot be supplied");
        }

        const document = {
          ...data,
          [AUTH_MODEL_FIELD]: authModel,
        };

        const result = await collection.insertOne(document);

        return {
          ...document,
          _id: result.insertedId,
        } as unknown as T;
      },

      async findOne<T>({
        model,
        where,
        select,
        join,
      }: AdapterMethodArgs<"findOne">) {
        const projection = getProjection(select);

        const result = await collection.findOne(
          buildFilter(model, where),
          projection ? { projection } : {},
        );

        if (!result) {
          return null;
        }

        const cleaned = cleanDocument(result);

        if (!cleaned) {
          return null;
        }

        return (await attachJoins(
          collection,
          cleaned,
          join,
        )) as T;
      },

      async findMany<T>({
        model,
        where,
        limit,
        select,
        sortBy,
        offset,
        join,
      }: AdapterMethodArgs<"findMany">) {
        const projection = getProjection(select);

        const cursor = collection.find(
          buildFilter(model, where),
          projection ? { projection } : {},
        );

        if (sortBy) {
          cursor.sort({
            [sortBy.field]: sortBy.direction === "asc" ? 1 : -1,
          });
        }

        if (offset !== undefined && offset > 0) {
          cursor.skip(offset);
        }

        cursor.limit(limit);

        const results = await cursor.toArray();

        const joinedResults = await Promise.all(
          results.map(async (item) => {
            const cleaned = cleanDocument(item);

            if (!cleaned) {
              return null;
            }

            return attachJoins(
              collection,
              cleaned,
              join,
            );
          }),
        );

        return joinedResults.filter(
          (item): item is NonNullable<typeof item> => item !== null,
        ) as T[];
      },

      async count({
        model,
        where,
      }: AdapterMethodArgs<"count">) {
        return collection.countDocuments(
          buildFilter(model, where),
        );
      },

      async update<T>({
        model,
        where,
        update,
      }: AdapterMethodArgs<"update">) {
        const safeUpdate = { ...(update as Document) };

        delete safeUpdate[AUTH_MODEL_FIELD];
        delete safeUpdate._id;

        const result = await collection.findOneAndUpdate(
          buildFilter(model, where),
          { $set: safeUpdate },
          { returnDocument: "after" },
        );

        return cleanDocument(result) as T | null;
      },

      async updateMany({
        model,
        where,
        update,
      }: AdapterMethodArgs<"updateMany">) {
        const safeUpdate = { ...update };

        delete safeUpdate[AUTH_MODEL_FIELD];
        delete safeUpdate._id;

        const result = await collection.updateMany(
          buildFilter(model, where),
          { $set: safeUpdate },
        );

        return result.modifiedCount;
      },

      async delete({
        model,
        where,
      }: AdapterMethodArgs<"delete">) {
        await collection.deleteOne(
          buildFilter(model, where),
        );
      },

      async deleteMany({
        model,
        where,
      }: AdapterMethodArgs<"deleteMany">) {
        const result = await collection.deleteMany(
          buildFilter(model, where),
        );

        return result.deletedCount;
      },

      async consumeOne<T>({
        model,
        where,
      }: AdapterMethodArgs<"consumeOne">) {
        const result = await collection.findOneAndDelete(
          buildFilter(model, where),
        );

        return cleanDocument(result) as T | null;
      },

      async incrementOne<T>({
        model,
        where,
        increment,
        set,
      }: AdapterMethodArgs<"incrementOne">) {
        const safeSet = { ...(set ?? {}) };
        const safeIncrement = { ...increment };

        delete safeSet[AUTH_MODEL_FIELD];
        delete safeSet._id;

        delete safeIncrement[AUTH_MODEL_FIELD];
        delete safeIncrement._id;

        const update: Document = {};

        if (Object.keys(safeSet).length > 0) {
          update.$set = safeSet;
        }

        if (Object.keys(safeIncrement).length > 0) {
          update.$inc = safeIncrement;
        }

        const result = await collection.findOneAndUpdate(
          buildFilter(model, where),
          update,
          { returnDocument: "after" },
        );

        return cleanDocument(result) as T | null;
      },
    };

    return adapter;
  };
}
