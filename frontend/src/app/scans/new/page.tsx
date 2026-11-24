import ScanForm from '@/components/ScanForm';

export default function NewScanPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">Run New UI/UX Flow Audit</h1>
        <p className="text-sm text-black/60 mt-1">
          Provide a public website address. FlowLens will launch an isolated browser session, perform a human-like
          step-by-step scroll recording, evaluate 7 categories, and persist the report.
        </p>
      </div>

      <ScanForm />
    </div>
  );
}
