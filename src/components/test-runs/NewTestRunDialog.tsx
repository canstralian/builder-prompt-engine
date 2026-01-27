import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Play, Star, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePromptTesting } from "@/hooks/usePromptTesting";

interface NewTestRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const ratingLabels = {
  clarity: "Clarity",
  completeness: "Completeness",
  correctness: "Correctness",
  styleMatch: "Style Match",
};

export function NewTestRunDialog({ open, onOpenChange, onComplete }: NewTestRunDialogProps) {
  const { runTest, saveTestRun, isGenerating, isSaving } = usePromptTesting();

  // Step 1: Input
  const [promptTitle, setPromptTitle] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");

  // Step 2: Outputs
  const [outputs, setOutputs] = useState<string[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<number>(0);

  // Step 3: Ratings
  const [ratings, setRatings] = useState({
    clarity: 0,
    completeness: 0,
    correctness: 0,
    styleMatch: 0,
  });
  const [notes, setNotes] = useState("");

  const [step, setStep] = useState<"input" | "outputs" | "ratings">("input");

  const handleGenerate = async () => {
    if (!promptTitle.trim() || !userPrompt.trim()) return;

    const result = await runTest({
      promptTitle,
      systemPrompt: systemPrompt || undefined,
      userPrompt,
    });

    if (result) {
      setOutputs(result);
      setStep("outputs");
    }
  };

  const handleProceedToRatings = () => {
    setStep("ratings");
  };

  const handleSave = async () => {
    const allRated = Object.values(ratings).every((r) => r > 0);

    const result = await saveTestRun(
      {
        promptTitle,
        systemPrompt: systemPrompt || undefined,
        userPrompt,
      },
      outputs,
      allRated
        ? {
            clarity: ratings.clarity,
            completeness: ratings.completeness,
            correctness: ratings.correctness,
            styleMatch: ratings.styleMatch,
          }
        : undefined,
      notes || undefined
    );

    if (result) {
      handleClose();
      onComplete();
    }
  };

  const handleClose = () => {
    setPromptTitle("");
    setSystemPrompt("");
    setUserPrompt("");
    setOutputs([]);
    setSelectedOutput(0);
    setRatings({ clarity: 0, completeness: 0, correctness: 0, styleMatch: 0 });
    setNotes("");
    setStep("input");
    onOpenChange(false);
  };

  const RatingStars = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "input" && "New Test Run"}
            {step === "outputs" && "Review Outputs"}
            {step === "ratings" && "Rate the Output"}
          </DialogTitle>
          <DialogDescription>
            {step === "input" && "Enter your prompt to generate test outputs"}
            {step === "outputs" && "Review the generated variants and proceed to rate"}
            {step === "ratings" && "Evaluate the output quality across key dimensions"}
          </DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="promptTitle">Prompt Title</Label>
              <Input
                id="promptTitle"
                placeholder="e.g., Marketing Email Generator"
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt (optional)</Label>
              <Textarea
                id="systemPrompt"
                placeholder="You are a helpful assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPrompt">User Prompt</Label>
              <Textarea
                id="userPrompt"
                placeholder="Write a marketing email for..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !promptTitle.trim() || !userPrompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Generate 3 Variants
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "outputs" && (
          <div className="space-y-4 py-4">
            <div className="flex gap-2 mb-4">
              {outputs.map((_, idx) => (
                <Button
                  key={idx}
                  variant={selectedOutput === idx ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOutput(idx)}
                >
                  Variant {idx + 1}
                </Button>
              ))}
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30 min-h-[200px] max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {outputs[selectedOutput] || "No output generated"}
              </pre>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("input")}>
                Back
              </Button>
              <Button onClick={handleProceedToRatings}>
                Proceed to Rate
              </Button>
            </div>
          </div>
        )}

        {step === "ratings" && (
          <div className="space-y-6 py-4">
            <div className="grid gap-4">
              {(Object.keys(ratingLabels) as Array<keyof typeof ratingLabels>).map(
                (key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <span className="font-medium">{ratingLabels[key]}</span>
                    <RatingStars
                      value={ratings[key]}
                      onChange={(val) =>
                        setRatings((prev) => ({ ...prev, [key]: val }))
                      }
                    />
                  </div>
                )
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any observations or notes about this test run..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("outputs")}>
                Back
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Test Run
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
