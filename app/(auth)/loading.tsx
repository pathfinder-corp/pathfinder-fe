export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="-mb-2 inline-block size-14 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-spin" />
        <p className="mt-4 text-4xl text-neutral-400">Loading...</p>
      </div>
    </div>
  );
}
