export default function AIAssistantLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading AI Assistant...</p>
      </div>
    </div>
  );
}
