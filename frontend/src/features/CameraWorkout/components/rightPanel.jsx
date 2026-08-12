import SessionOverviewCard from "./sessionOverviewCard";
import BiometricsCard from "./bioMetricsCard";
import SessionLog from "./sessionLog";
import NeuralStatusCard from "./neuralStatusCard";

export default function RightPanel({ biometrics, logs, repCount, elapsedSecs, poseReady, loadError }) {
  return (
    <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 sm:gap-5">
      <SessionOverviewCard repCount={repCount} elapsedSecs={elapsedSecs} />
      <BiometricsCard biometrics={biometrics} />
      <SessionLog logs={logs} />
      <NeuralStatusCard poseReady={poseReady} loadError={loadError} />
    </div>
  );
}
