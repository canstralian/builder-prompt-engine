import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  FileText,
  Palette,
  Shield,
  Code,
  Sparkles,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Goal", description: "Define the output", icon: Target },
  { id: 2, title: "Context", description: "Set the inputs", icon: FileText },
  { id: 3, title: "Style", description: "Tone & format", icon: Palette },
  { id: 4, title: "Safety", description: "Guardrails", icon: Shield },
  { id: 5, title: "Output", description: "Schema", icon: Code },
];

const outputFormats = [
  { value: "text", label: "Plain Text" },
  { value: "markdown", label: "Markdown" },
  { value: "json", label: "JSON" },
  { value: "bullets", label: "Bullet List" },
  { value: "table", label: "Table" },
];

const tones = [
  "Professional",
  "Casual",
  "Friendly",
  "Technical",
  "Persuasive",
  "Educational",
];

export default function PromptBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    audience: "",
    context: "",
    constraints: "",
    tone: "Professional",
    verbosity: "balanced",
    format: "text",
    safety: "",
    outputSchema: "",
    variables: [] as { name: string; type: string; required: boolean }[],
  });

  const updateFormData = (field: string, value: string | { name: string; type: string; required: boolean }[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addVariable = () => {
    setFormData((prev) => ({
      ...prev,
      variables: [...prev.variables, { name: "", type: "string", required: true }],
    }));
  };

  const removeVariable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    // Save logic would go here
    // Note: Actual save to database will be implemented with prompts table
    window.location.href = "/app/library";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/app/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Prompt Builder</h1>
            <p className="text-muted-foreground">
              Create a high-quality prompt step by step
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline text-sm font-medium">
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 mx-2 hidden sm:block",
                    currentStep > step.id ? "bg-emerald-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8 rounded-2xl border border-border bg-card">
        {/* Step 1: Goal */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Define Your Goal</h2>
              <p className="text-muted-foreground">
                What do you want the AI to produce? Be specific about the desired output.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Prompt Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Marketing Email Generator"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Goal Description</Label>
                <Textarea
                  id="goal"
                  placeholder="Describe what you want the AI to generate. For example: 'Generate a compelling marketing email that promotes a product launch and drives conversions.'"
                  rows={4}
                  value={formData.goal}
                  onChange={(e) => updateFormData("goal", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., B2B SaaS decision makers, Technical developers"
                  value={formData.audience}
                  onChange={(e) => updateFormData("audience", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Context */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Set the Context</h2>
              <p className="text-muted-foreground">
                Define the inputs and constraints for your prompt.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="context">Background Context</Label>
                <Textarea
                  id="context"
                  placeholder="Provide any background information the AI needs to know..."
                  rows={4}
                  value={formData.context}
                  onChange={(e) => updateFormData("context", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Variables</Label>
                  <Button variant="outline" size="sm" onClick={addVariable}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Variable
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Define dynamic inputs using {"{{variable_name}}"} syntax.
                </p>
                {formData.variables.map((variable, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Variable name"
                      value={variable.name}
                      onChange={(e) => {
                        const newVars = [...formData.variables];
                        newVars[index].name = e.target.value;
                        updateFormData("variables", newVars);
                      }}
                    />
                    <Select
                      value={variable.type}
                      onValueChange={(value) => {
                        const newVars = [...formData.variables];
                        newVars[index].type = value;
                        updateFormData("variables", newVars);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariable(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints</Label>
                <Textarea
                  id="constraints"
                  placeholder="Any limitations or requirements (e.g., max length, specific terminology)..."
                  rows={3}
                  value={formData.constraints}
                  onChange={(e) => updateFormData("constraints", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Style */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Style & Tone</h2>
              <p className="text-muted-foreground">
                Define how the output should sound and feel.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((tone) => (
                    <Button
                      key={tone}
                      variant={formData.tone === tone ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFormData("tone", tone)}
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Verbosity</Label>
                <div className="flex gap-2">
                  {["concise", "balanced", "detailed"].map((level) => (
                    <Button
                      key={level}
                      variant={formData.verbosity === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFormData("verbosity", level)}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => updateFormData("format", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Safety */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Safety Guardrails</h2>
              <p className="text-muted-foreground">
                Define what the AI should avoid or refuse.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="safety">Safety Instructions</Label>
                <Textarea
                  id="safety"
                  placeholder="e.g., 'Do not include personal data. Refuse to generate harmful content. Avoid making medical or legal claims.'"
                  rows={4}
                  value={formData.safety}
                  onChange={(e) => updateFormData("safety", e.target.value)}
                />
              </div>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">
                  Recommended safety practices
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Avoid generating personally identifiable information (PII)</li>
                  <li>• Include refusal guidance for harmful requests</li>
                  <li>• Specify content boundaries clearly</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Output */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Output Schema</h2>
              <p className="text-muted-foreground">
                Define the structure of your expected output.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="outputSchema">Output Structure</Label>
                <Textarea
                  id="outputSchema"
                  placeholder={`For JSON format:\n{\n  "subject": "string",\n  "body": "string",\n  "cta": "string"\n}\n\nFor other formats, describe the expected structure...`}
                  rows={8}
                  className="font-mono text-sm"
                  value={formData.outputSchema}
                  onChange={(e) => updateFormData("outputSchema", e.target.value)}
                />
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-medium mb-3">Prompt Preview</h4>
                <div className="p-4 rounded-lg bg-background border border-border">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    <strong>System:</strong> You are a professional assistant. Your task is to{" "}
                    {formData.goal || "[goal will appear here]"}.
                    {formData.audience && (
                      <> Target audience: {formData.audience}.</>
                    )}
                    {formData.context && <> Context: {formData.context}</>}
                    {formData.tone && <> Use a {formData.tone.toLowerCase()} tone.</>}
                    {formData.safety && <> {formData.safety}</>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Check className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
