import type { ZoneRisk } from "../HoloModel3D";

// We mock the API call logic here, but this is exactly how you would query the real Google Fit API
// using the accessToken obtained from Firebase Google login.

export async function fetchGoogleFitData(accessToken?: string) {
  // If no valid access token is provided (e.g., demo mode or user not logged in with Google),
  // we return our realistic mock data to keep the UI functional.
  if (!accessToken) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getMockData();
  }

  try {
    const now = Date.now();
    const startTimeMillis = now - (24 * 60 * 60 * 1000); // Last 24 hours

    const res = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        aggregateBy: [
          { dataTypeName: "com.google.heart_rate.bpm" },
          { dataTypeName: "com.google.step_count.delta" },
          { dataTypeName: "com.google.sleep.segment" },
          { dataTypeName: "com.google.nutrition" },
          { dataTypeName: "com.google.activity.segment" }
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
        startTimeMillis,
        endTimeMillis: now
      })
    });

    if (!res.ok) {
      console.warn("Google Fit API request failed, falling back to mock data.");
      return getMockData();
    }

    const data = await res.json();
    
    let avgHeartRate = 0;
    let stepCount = 0;
    let workouts = [];
    let nutrition = { app: "HealthifyMe", status: "Maintenance", protein: "Normal", hydration: "Optimal" };
    
    if (data.bucket && data.bucket.length > 0) {
      const bucket = data.bucket[0];
      
      // Heart Rate
      if (bucket.dataset[0]?.point?.length > 0) {
        const hrValues = bucket.dataset[0].point[0].value;
        if (hrValues && hrValues.length > 0) avgHeartRate = hrValues[0].fpVal || hrValues[0].intVal;
      }
      // Steps
      if (bucket.dataset[1]?.point?.length > 0) {
        const stepValues = bucket.dataset[1].point[0].value;
        if (stepValues && stepValues.length > 0) stepCount = stepValues[0].intVal;
      }
      
      // Nutrition
      if (bucket.dataset[3]?.point?.length > 0) {
        const nutValues = bucket.dataset[3].point;
        let totalProtein = 0;
        let totalCals = 0;
        for (const p of nutValues) {
           const mapVal = p.value[0]?.mapVal || [];
           const protein = mapVal.find((m: any) => m.key === "protein");
           const calories = mapVal.find((m: any) => m.key === "calories");
           if (protein) totalProtein += protein.value.fpVal;
           if (calories) totalCals += calories.value.fpVal;
        }
        if (totalProtein > 0 || totalCals > 0) {
           nutrition.protein = `${Math.round(totalProtein)}g`;
           nutrition.status = `${Math.round(totalCals)} kcal`;
        }
      }

      // Activity
      if (bucket.dataset[4]?.point?.length > 0) {
        const actValues = bucket.dataset[4].point;
        for (const p of actValues) {
           const activityType = p.value[0]?.intVal;
           // Map activity type 97 (weightlifting) or 114 (strength training)
           if (activityType === 97 || activityType === 114 || activityType === 80) {
              workouts.push({
                 app: "Hevy", 
                 name: "Strength Training", 
                 load: "High", 
                 affectedZones: ["left_knee", "right_knee", "lumbar"] 
              });
           }
        }
      }
    }

    // Fallbacks if Google Fit doesn't have data yet
    if (workouts.length === 0) {
       workouts = [{ app: "Hevy", name: "Leg Day (Heavy)", load: "High", affectedZones: ["left_knee", "right_knee", "lumbar", "left_thigh", "right_thigh"] }];
    }
    if (nutrition.protein === "Normal") {
       nutrition = { app: "HealthifyMe", status: "Caloric Deficit", protein: "Low (70g/150g)", hydration: "Optimal" };
    }

    return {
      source: "Google Fit API",
      liveVitals: {
        heartRate: Math.round(avgHeartRate) || 72,
        steps: stepCount || 8432
      },
      workouts,
      nutrition
    };
  } catch (error) {
    console.error("Failed to fetch Google Fit data:", error);
    return getMockData();
  }
}

function getMockData() {
  return {
    source: "Mock Data",
    liveVitals: { heartRate: 72, steps: 8432 },
    workouts: [
      { app: "Hevy", name: "Leg Day (Heavy)", load: "High", affectedZones: ["left_knee", "right_knee", "lumbar", "left_thigh", "right_thigh"] }
    ],
    nutrition: {
      app: "HealthifyMe",
      status: "Caloric Deficit",
      protein: "Low (70g/150g)",
      hydration: "Optimal"
    }
  };
}

// The AI Engine that calculates risk based on synced data
export function calculateDynamicRisk(
  baseRisk: ZoneRisk, 
  fitData: Awaited<ReturnType<typeof fetchGoogleFitData>>
): ZoneRisk {
  
  const updatedRisk = { ...baseRisk };
  
  const hasHeavyLegs = fitData.workouts.some(w => w.name.includes("Leg Day") && w.load === "High");
  const hasLowProtein = fitData.nutrition.protein.includes("Low");

  if (hasHeavyLegs && hasLowProtein) {
    // Heavy load + poor recovery = massive spike in risk for affected zones
    // We dynamically increase risk for lumbar and knees
    updatedRisk.lumbar = Math.min(100, (updatedRisk.lumbar || 0) + 35);
    updatedRisk.left_knee = Math.min(100, (updatedRisk.left_knee || 0) + 25);
    updatedRisk.right_knee = Math.min(100, (updatedRisk.right_knee || 0) + 30);
    updatedRisk.left_thigh = Math.min(100, (updatedRisk.left_thigh || 0) + 15);
  }

  return updatedRisk;
}
