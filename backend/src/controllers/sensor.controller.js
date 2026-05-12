const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const {
  broadcastSensorReading,
  getLatestSensorReading,
} = require("../config/websocketHub");
const { predictFromSensorData } = require("../services/ml.service");
const { createSensorReading } = require("../services/sensorReading.service");
const { sensorDataSchema } = require("../validators/sensor.validator");

const receiveSensorData = asyncHandler(async (req, res) => {
  console.log("📥 Received sensor data:", JSON.stringify(req.body, null, 2));

  const reading = await createSensorReading(req.body, predictFromSensorData);
  console.log(
    "🔄 Normalized sensor data:",
    JSON.stringify(reading.sensorData, null, 2),
  );

  const normalizedReading = {
    ...reading,
    sensorData: sensorDataSchema.parse(reading.sensorData),
  };

  console.log(
    "✅ Validated sensor data:",
    JSON.stringify(normalizedReading.sensorData, null, 2),
  );
  console.log(
    "🤖 Prediction result:",
    JSON.stringify(normalizedReading.prediction, null, 2),
  );

  broadcastSensorReading(normalizedReading);

  success(
    res,
    normalizedReading,
    "Sensor reading predicted and broadcasted.",
    201,
  );
});

const getLatest = asyncHandler(async (req, res) => {
  const latest = getLatestSensorReading();

  success(
    res,
    latest,
    latest
      ? "Latest sensor reading fetched."
      : "No sensor reading generated yet.",
  );
});

module.exports = {
  receiveSensorData,
  getLatest,
};
