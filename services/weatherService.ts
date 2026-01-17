
export const getWatershedWeather = async (lat: number, lng: number) => {
  try {
    // Fetch precipitation for past 2 days + today
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&timezone=auto&past_days=2`
    );
    const data = await response.json();
    
    if (!data.daily || !data.daily.precipitation_sum) return null;

    // Sum precipitation (mm)
    const totalPrecipMm = data.daily.precipitation_sum.reduce((acc: number, val: number) => acc + val, 0);
    
    // Convert to inches for Maine locale
    const totalPrecipIn = totalPrecipMm / 25.4;
    
    return {
      totalPrecipIn: totalPrecipIn.toFixed(2),
      hasRunoffRisk: totalPrecipIn > 1.0 // >1 inch in 48h indicates runoff risk
    };
  } catch (error) {
    console.error("Weather Service Error:", error);
    return null;
  }
};
