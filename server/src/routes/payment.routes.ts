
import { Router, raw, json } from "express";
import type { Db, Document } from "mongodb";
import Stripe from "stripe";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";

type PaymentUserRecord = Document & {
  _id: string;
  _authModel: "user";
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  plan: "free" | "pro";
};

type PaymentRecord = Document & {
  userEmail: string;
  userName: string;
  userRole: "student" | "tutor";
  planName: "pro";
  amount: number;
  currency: "usd";
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "pending" | "paid";
  paidAt: Date | null;
  createdAt: Date;
};

export function createPaymentRouter(database: Db) {
  const router = Router();
  const auth = createAuthMiddleware(database);

  const users = database.collection<PaymentUserRecord>("users");
  const payments = database.collection<PaymentRecord>("payments");

  const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY || "sk_test_placeholder"
  );

  const clientURL =
    process.env.CLIENT_URL || "http://localhost:3000";

  /**
   * Verify and activate a completed Stripe payment.
   *
   * Both the webhook and the verification endpoint use this
   * function, so membership activation is consistent and repeatable.
   */
  async function activatePaidSession(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    if (
      session.payment_status !== "paid" ||
      session.mode !== "payment"
    ) {
      throw new Error("Stripe payment is not completed.");
    }

    const metadata = session.metadata;
    const userRole = metadata?.userRole;

    if (
      !metadata?.userId ||
      !metadata.userEmail ||
      !metadata.userName ||
      (userRole !== "student" && userRole !== "tutor") ||
      metadata.planName !== "pro"
    ) {
      throw new Error("Invalid payment metadata.");
    }

    // Student Pro = $10; Tutor Pro = $15.
    const expectedAmount = userRole === "student" ? 10 : 15;

    if (
      session.amount_total !== expectedAmount * 100 ||
      session.currency !== "usd"
    ) {
      throw new Error("Invalid payment amount or currency.");
    }

    // Verify the account against the original database record.
    const user = await users.findOne({
      _id: metadata.userId,
      _authModel: "user",
      email: metadata.userEmail,
      role: userRole,
    });

    if (!user) {
      throw new Error("Payment user could not be verified.");
    }

    const transactionId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? "";

    // Activate only the verified account.
    const userUpdate = await users.updateOne(
      {
        _id: metadata.userId,
        _authModel: "user",
        email: metadata.userEmail,
        role: userRole,
      },
      {
        $set: { plan: "pro" },
      }
    );

    if (userUpdate.matchedCount !== 1) {
      throw new Error("Membership account could not be updated.");
    }

    // Update the existing pending payment or safely create it.
    await payments.updateOne(
      { stripeSessionId: session.id },
      {
        $set: {
          userEmail: metadata.userEmail,
          userName: metadata.userName,
          userRole,
          planName: "pro",
          amount: expectedAmount,
          currency: "usd",
          transactionId,
          stripeSessionId: session.id,
          paymentStatus: "paid",
          paidAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  // Stripe webhook: preserve the original raw request body.
  router.post(
    "/webhook",
    raw({ type: "application/json" }),
    async (req, res) => {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const signature = req.headers["stripe-signature"];

      if (!webhookSecret || typeof signature !== "string") {
        res.status(400).send(
          "Webhook configuration or signature is missing."
        );
        return;
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (error) {
        console.error(
          "Stripe webhook signature verification failed:",
          error
        );

        res.status(400).send("Invalid webhook signature.");
        return;
      }

      try {
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;

          if (session.payment_status === "paid") {
            await activatePaidSession(session);
          }
        }

        res.status(200).json({ received: true });
      } catch (error) {
        // Return 500 so Stripe can retry failed webhook delivery.
        console.error("Stripe webhook processing failed:", error);

        res.status(500).send("Webhook processing failed.");
      }
    }
  );

  // JSON parser for checkout and other API requests.
  router.use(json());

  // Student/Tutor: View own payment history.
  router.get("/mine", auth.verifyToken, async (req, res) => {
    try {
      const user = res.locals.authUser;

      const history = await payments
        .find(
          { userEmail: user.email },
          {
            projection: {
              userEmail: 1,
              userName: 1,
              userRole: 1,
              planName: 1,
              amount: 1,
              currency: 1,
              transactionId: 1,
              stripeSessionId: 1,
              paymentStatus: 1,
              paidAt: 1,
              createdAt: 1,
            },
          }
        )
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).json({
        success: true,
        totalPayments: history.length,
        payments: history,
      });
    } catch (error) {
      console.error("Payment history retrieval failed:", error);

      res.status(500).json({
        success: false,
        message: "Failed to retrieve payment history.",
      });
    }
  });

  // Admin: View all payment transactions.
  router.get(
    "/transactions",
    auth.verifyToken,
    auth.verifyAdmin,
    async (req, res) => {
      try {
        const page = Math.max(1, Number(req.query.page) || 1);

        const limit = Math.min(
          100,
          Math.max(1, Number(req.query.limit) || 10)
        );

        const skip = (page - 1) * limit;

        const [transactions, totalTransactions] = await Promise.all([
          payments
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),

          payments.countDocuments(),
        ]);

        res.status(200).json({
          success: true,
          transactions,
          pagination: {
            currentPage: page,
            limit,
            totalTransactions,
            totalPages: Math.ceil(totalTransactions / limit),
          },
        });
      } catch (error) {
        console.error("Admin transaction retrieval failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to retrieve transactions.",
        });
      }
    }
  );

  // Student/Tutor: Verify ownership and payment status of a Checkout Session.
  router.get(
    "/verify/:sessionId",
    auth.verifyToken,
    async (req, res) => {
      try {
        const user = res.locals.authUser;
        const sessionId = req.params.sessionId;

        if (
          typeof sessionId !== "string" ||
          !sessionId.startsWith("cs_")
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid checkout session ID.",
          });
          return;
        }

        if (user.role !== "student" && user.role !== "tutor") {
          res.status(403).json({
            success: false,
            message: "Only students and tutors can verify Pro payments.",
          });
          return;
        }

        // Retrieve the authoritative payment status directly from Stripe.
        const session =
          await stripe.checkout.sessions.retrieve(sessionId);

        const metadata = session.metadata;

        // A user can only verify a session created for their own account.
        if (
          !metadata ||
          metadata.userId !== user.id ||
          metadata.userEmail !== user.email ||
          metadata.userRole !== user.role ||
          metadata.planName !== "pro"
        ) {
          res.status(403).json({
            success: false,
            message: "This checkout session does not belong to your account.",
          });
          return;
        }

        const expectedAmount = user.role === "student" ? 10 : 15;

        if (
          session.mode !== "payment" ||
          session.amount_total !== expectedAmount * 100 ||
          session.currency !== "usd"
        ) {
          res.status(400).json({
            success: false,
            message: "Checkout session details could not be verified.",
          });
          return;
        }

        // Fallback activation: do not depend exclusively on webhook timing.
        if (session.payment_status === "paid") {
          await activatePaidSession(session);
        }

        // Read the saved record after activation.
        const payment = await payments.findOne({
          stripeSessionId: session.id,
          userEmail: user.email,
          userRole: user.role,
          paymentStatus: "paid",
        });

        const paymentRecorded = Boolean(payment);

        res.status(200).json({
          success: true,
          sessionId: session.id,
          paymentStatus: session.payment_status,
          paymentRecorded,
          plan: paymentRecorded ? "pro" : user.plan,
          message:
            session.payment_status === "paid"
              ? paymentRecorded
                ? "Payment verified successfully."
                : "Payment activation is processing."
              : "Payment has not been completed.",
        });
      } catch (error) {
        console.error("Payment verification failed:", error);

        res.status(500).json({
          success: false,
          message: "Unable to verify this payment right now.",
        });
      }
    }
  );

  // Student/Tutor: Create a Stripe Pro checkout session.
  router.post("/checkout", auth.verifyToken, async (req, res) => {
    try {
      const user = res.locals.authUser;

      if (user.role !== "student" && user.role !== "tutor") {
        res.status(403).json({
          success: false,
          message: "Only students and tutors can purchase Pro membership.",
        });
        return;
      }

      if (user.plan === "pro") {
        res.status(409).json({
          success: false,
          message: "Your account already has Pro membership.",
        });
        return;
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        res.status(503).json({
          success: false,
          message: "Stripe payment is not configured yet.",
        });
        return;
      }

      const amount = user.role === "student" ? 10 : 15;

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,

        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "MentorLagbe Pro Membership",
                description: `${user.role} Pro membership`,
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],

        metadata: {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          userRole: user.role,
          planName: "pro",
        },

        success_url: `${clientURL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientURL}/payment/cancel`,
      });

      await payments.insertOne({
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        planName: "pro",
        amount,
        currency: "usd",
        transactionId: "",
        stripeSessionId: session.id,
        paymentStatus: "pending",
        paidAt: null,
        createdAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Stripe checkout session created.",
        checkoutUrl: session.url,
        sessionId: session.id,
        amount,
        currency: "usd",
      });
    } catch (error) {
      console.error("Stripe checkout creation failed:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create checkout session.",
      });
    }
  });

  return router;
}
