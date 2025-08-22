"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Webhook,
  Key,
  Mail,
  Database,
  Settings,
  Copy,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("ln_live_abc123...");
  const [zapierConnected, setZapierConnected] = useState(false);
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      name: "Link Click Webhook",
      url: "https://hooks.zapier.com/hooks/catch/123/abc/",
      event: "link_click",
      active: true,
    },
    {
      id: 2,
      name: "Profile View Webhook",
      url: "https://example.com/webhook",
      event: "profile_view",
      active: false,
    },
  ]);

  const handleTestWebhook = async (webhookUrl: string) => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          event: "test",
          timestamp: new Date().toISOString(),
          data: { message: "Test webhook from Lynx" },
        }),
      });

      toast({
        title: "Webhook Sent",
        description:
          "Test webhook sent successfully. Check your endpoint to confirm receipt.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          "Failed to send webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const generateNewApiKey = () => {
    setApiKey(`ln_live_${Math.random().toString(36).substr(2, 20)}`);
    toast({
      title: "New API Key Generated",
      description: "Your old API key has been revoked",
    });
  };

  const connectZapier = () => {
    setZapierConnected(true);
    toast({
      title: "Zapier Connected",
      description: "You can now create Zaps with your Lynx data",
    });
  };

  const addWebhook = () => {
    if (!webhookUrl) return;

    const newWebhook = {
      id: Date.now(),
      name: `Webhook ${webhooks.length + 1}`,
      url: webhookUrl,
      event: "link_click",
      active: true,
    };

    setWebhooks([...webhooks, newWebhook]);
    setWebhookUrl("");
    toast({
      title: "Webhook Added",
      description: "New webhook has been configured",
    });
  };

  const deleteWebhook = (id: number) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast({
      title: "Webhook Deleted",
      description: "Webhook has been removed",
    });
  };

  return (
    <div className="space-y-6 mb-16">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your links to other tools and automate your workflows
        </p>
      </div>

      <Tabs defaultValue="popular" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">Zapier</CardTitle>
                  {zapierConnected && (
                    <Badge variant="secondary">Connected</Badge>
                  )}
                </div>
                <CardDescription>
                  Automate workflows with 6000+ apps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Trigger actions when links are clicked, send data to Google
                  Sheets, CRM systems, and more.
                </p>
                {!zapierConnected ? (
                  <Button onClick={connectZapier} className="w-full">
                    Connect Zapier
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href="https://zapier.com/apps/Lynx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Zaps
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Mailchimp</CardTitle>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <CardDescription>
                  Sync contacts and trigger email campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Automatically add link clickers to your email lists and send
                  targeted campaigns.
                </p>
                <Button variant="outline" disabled className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Google Sheets</CardTitle>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <CardDescription>
                  Export analytics data automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sync your link performance data to Google Sheets for custom
                  reporting and analysis.
                </p>
                <Button variant="outline" disabled className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Webhook</CardTitle>
              <CardDescription>
                Get real-time notifications when events happen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addWebhook} disabled={!webhookUrl}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => handleTestWebhook(webhookUrl)}
                disabled={!webhookUrl}
                className="w-full md:w-auto"
              >
                Test Webhook
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Webhooks</CardTitle>
              <CardDescription>Manage your configured webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-4 sm:space-y-0"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium break-words">
                          {webhook.name}
                        </h4>
                        <Badge
                          variant={webhook.active ? "default" : "secondary"}
                        >
                          {webhook.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground break-words">
                        {webhook.url}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Event: {webhook.event}
                      </p>
                    </div>
                    <div className="flex items-center sm:justify-end gap-2">
                      <Switch checked={webhook.active} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook.url)}
                      >
                        <Webhook className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Use our REST API to integrate Lynx with your applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={apiKey}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateNewApiKey}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep your API key secret. It gives full access to your
                  account.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  value="https://api.Lynx.app/v1"
                  readOnly
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Documentation</Label>
                <Button variant="outline" asChild>
                  <a href="/docs/api" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View API Docs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <code className="text-xs bg-muted p-2 rounded block">
                    GET /links
                  </code>
                  <p className="text-muted-foreground">Get all your links</p>
                </div>
                <div className="space-y-1">
                  <code className="text-xs bg-muted p-2 rounded block">
                    POST /links
                  </code>
                  <p className="text-muted-foreground">Create a new link</p>
                </div>
                <div className="space-y-1">
                  <code className="text-xs bg-muted p-2 rounded block">
                    GET /analytics
                  </code>
                  <p className="text-muted-foreground">Get analytics data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>
                Set up automatic actions based on events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Auto-hide low performing links
                  </h4>
                  <Switch />
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically hide links that haven&apos;t been clicked in 30 days
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Weekly performance email</h4>
                  <Switch defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  Get a weekly summary of your link performance via email
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Smart link suggestions</h4>
                  <Switch defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered suggestions for new links based on your content
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Automation</CardTitle>
              <CardDescription>
                Create advanced automation rules with code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Automation Script</Label>
                <Textarea
                  placeholder="Example: Send webhook when link gets 100 clicks"
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Test Script
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
