import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/ui/motion";
import {
  Users,
  Mail,
  Crown,
  Shield,
  User,
  UserPlus,
  MoreHorizontal,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const members = [
  { id: "1", name: "Demo User", email: "demo@promptcrafting.net", role: "owner", avatar: null },
  { id: "2", name: "Sarah Chen", email: "sarah@company.com", role: "admin", avatar: null },
  { id: "3", name: "Alex Johnson", email: "alex@company.com", role: "member", avatar: null },
  { id: "4", name: "Jamie Williams", email: "jamie@company.com", role: "viewer", avatar: null },
];

const RoleBadge = ({ role }: { role: string }) => {
  const variants: Record<string, { variant: "accent" | "default" | "secondary" | "muted"; icon: React.ComponentType<{ className?: string }> }> = {
    owner: { variant: "accent", icon: Crown },
    admin: { variant: "default", icon: Shield },
    member: { variant: "secondary", icon: User },
    viewer: { variant: "muted", icon: User },
  };

  const { variant, icon: Icon } = variants[role] || variants.viewer;

  return (
    <Badge variant={variant} className="capitalize">
      <Icon className="mr-1 h-3 w-3" />
      {role}
    </Badge>
  );
};

export default function WorkspacePage() {
  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="Workspace Settings"
        description="Manage your workspace, team members, and settings."
      />

      {/* Workspace Info */}
      <FadeIn delay={0.1}>
        <div className="p-6 border border-border bg-card space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold">Workspace</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input id="workspace-name" defaultValue="My Workspace" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-slug">Workspace URL</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                  promptcrafting.net/
                </span>
                <Input id="workspace-slug" defaultValue="my-workspace" className="border-l-0" />
              </div>
            </div>
          </div>
          <Button>Save Changes</Button>
        </div>
      </FadeIn>

      {/* Team Members */}
      <FadeIn delay={0.15}>
        <div className="p-6 border border-border bg-card space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Team Members</h2>
              <p className="text-sm text-muted-foreground">{members.length} members</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your workspace.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Member</Button>
                      <Button variant="ghost" size="sm">Admin</Button>
                      <Button variant="ghost" size="sm">Viewer</Button>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RoleBadge role={member.role} />
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem>Change role</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* API Settings */}
      <FadeIn delay={0.2}>
        <div className="p-6 border border-border bg-card space-y-4 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">API Settings</h2>
            <p className="text-sm text-muted-foreground">
              Configure your AI model provider for test runs.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API Endpoint</Label>
              <Input
                id="api-endpoint"
                placeholder="https://api.openai.com/v1"
                defaultValue="https://api.openai.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  defaultValue="sk-••••••••••••••••••••"
                />
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is encrypted and stored securely.
              </p>
            </div>
          </div>
          <Button>Save API Settings</Button>
        </div>
      </FadeIn>

      {/* Danger Zone */}
      <FadeIn delay={0.25}>
        <div className="p-6 border border-destructive/20 bg-destructive/5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">
              Irreversible actions. Please be careful.
            </p>
          </div>
          <Button variant="destructive">Delete Workspace</Button>
        </div>
      </FadeIn>
    </div>
  );
}
