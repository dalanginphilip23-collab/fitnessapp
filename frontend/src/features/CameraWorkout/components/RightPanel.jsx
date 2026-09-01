import SessionOverviewCard from "./SessionOverviewCard";
import BiometricsCard from "./BioMetricsCard";
import SessionLog from "./SessionLog";
import NeuralStatusCard from "./NeuralStatusCard";

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
