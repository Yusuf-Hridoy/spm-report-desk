// The h2 for each wizard step. Gets focus when the step changes (see App).
export function StepHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <div>
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold">
        {title}
      </h2>
      <p className="mt-2 max-w-prose text-gray-700">{intro}</p>
    </div>
  );
}
