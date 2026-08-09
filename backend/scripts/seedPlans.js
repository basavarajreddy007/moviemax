const SubscriptionPlan = require("../models/SubscriptionPlan");

const plans = [
  {
    name: "Free",
    slug: "free",
    description: "Enjoy ad-supported content in standard quality",
    price: 0,
    currency: "USD",
    duration: 30,
    durationUnit: "days",
    quality: "SD",
    maxDevices: 1,
    maxStreams: 1,
    adsFree: false,
    downloadEnabled: false,
    tier: 0,
    features: ["SD Quality", "1 Device", "1 Stream", "Ad-Supported", "No Downloads"],
    isActive: true,
  },
  {
    name: "Basic",
    slug: "basic",
    description: "HD streaming on 2 devices with no ads",
    price: 9.99,
    currency: "USD",
    duration: 30,
    durationUnit: "days",
    quality: "HD",
    maxDevices: 2,
    maxStreams: 2,
    adsFree: true,
    downloadEnabled: false,
    tier: 1,
    features: ["HD Quality", "2 Devices", "2 Streams", "Ad-Free", "No Downloads"],
    isActive: true,
  },
  {
    name: "Premium",
    slug: "premium",
    description: "Ultimate 4K experience on 4 devices with downloads",
    price: 19.99,
    currency: "USD",
    duration: 30,
    durationUnit: "days",
    quality: "4K",
    maxDevices: 4,
    maxStreams: 4,
    adsFree: true,
    downloadEnabled: true,
    tier: 2,
    features: ["4K Quality", "4 Devices", "4 Streams", "Ad-Free", "Downloads Enabled"],
    isActive: true,
  },
];

const seedPlans = async () => {
  try {
    const existing = await SubscriptionPlan.countDocuments();
    if (existing >= 3) {
      console.log(`Plans already seeded (${existing} plans found)`);
      return;
    }

    await SubscriptionPlan.deleteMany();
    for (const plan of plans) {
      await SubscriptionPlan.create(plan);
    }
    console.log(`Seeded ${plans.length} subscription plans`);
  } catch (err) {
    console.error("Error seeding plans:", err.message);
  }
};

module.exports = seedPlans;
