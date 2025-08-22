"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProfilePreview } from "@/components/dashboard/ProfilePreview";
import { useToast } from "@/hooks/use-toast";
import { Palette, Check } from "lucide-react";
import { useThemeStore, prebuiltThemes } from "@/stores/themeStore";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/utils/supabase/client";

const ThemesPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { toast } = useToast();
  const { user, fetchUser } = useUserStore();
  const [customTheme, setCustomTheme] = useState(theme);
  const [activeTab, setActiveTab] = useState("prebuilt");

  const updateUserTheme = async (themeId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ theme: themeId })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    fetchUser();
  };

  const handleThemeSelect = (themeId: string) => {
    const selected = prebuiltThemes.find((t) => t.id === themeId);
    if (!selected) return;

    setTheme(selected.config);
    updateUserTheme(themeId);

    toast({
      title: "Theme Applied",
      description: "Your profile theme has been updated successfully!",
    });
  };

  const handleCustomThemeUpdate = (
    field: keyof typeof theme,
    value: string
  ) => {
    const updated = { ...customTheme, [field]: value };
    setCustomTheme(updated);
    setTheme(updated);
  };

  const resetToDefault = () => {
    const defaultTheme = prebuiltThemes[0].config;
    setCustomTheme(defaultTheme);
    setTheme(defaultTheme);
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to default minimal style.",
    });
  };

  return (
    <div className="space-y-6 mb-16 md:pr-3">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Themes</h1>
        <p className="text-muted-foreground">
          Customize your profile appearance with prebuilt themes or create your
          own.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-2">
        <div className="lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prebuilt">Prebuilt Themes</TabsTrigger>
              <TabsTrigger value="custom">Custom Theme</TabsTrigger>
            </TabsList>

            <TabsContent value="prebuilt" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prebuiltThemes.map((themeOption) => {
                  const isActive = user?.theme === themeOption.id;
                  const Icon = themeOption.icon as React.ComponentType<{ className?: string }>;

                  return (
                    <Card
                      key={themeOption.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        isActive ? "ring-2 ring-primary shadow-lg" : ""
                      }`}
                      onClick={() => handleThemeSelect(themeOption.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              {themeOption.name}
                            </CardTitle>
                          </div>
                          {isActive && (
                            <Badge variant="default" className="bg-primary">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          {themeOption.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Outer background */}
                        <div
                          className="p-4 rounded-lg border"
                          style={{
                            background: themeOption.config.backgroundColor,
                          }}
                        >
                          {/* Card background */}
                          <div
                            className={`${themeOption.preview.borderRadius} space-y-2`}
                            style={{
                              background: themeOption.config.cardBackground,
                              padding: "0.75rem",
                            }}
                          >
                            {/* Text lines */}
                            <div
                              className="rounded"
                              style={{
                                height: "8px",
                                width: "75%",
                                backgroundColor: themeOption.config.textColor,
                                opacity: 0.6,
                              }}
                            ></div>
                            <div
                              className="rounded"
                              style={{
                                height: "6px",
                                width: "50%",
                                backgroundColor: themeOption.config.textColor,
                                opacity: 0.4,
                              }}
                            ></div>

                            {/* Button previews */}
                            <div className="space-y-1 pt-2">
                              <div
                                className="rounded"
                                style={{
                                  height: "24px",
                                  width: "100%",
                                  backgroundColor:
                                    themeOption.config.primaryColor,
                                  opacity: 0.2,
                                }}
                              ></div>
                              <div
                                className="rounded"
                                style={{
                                  height: "24px",
                                  width: "100%",
                                  backgroundColor:
                                    themeOption.config.primaryColor,
                                  opacity: 0.2,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 sm:gap-0">
                    <Palette className="h-5 w-5" />
                    <span>Custom Theme Editor</span>
                  </CardTitle>
                  <CardDescription>
                    Create your own unique theme by customizing colors, fonts,
                    and styles.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Background Color */}
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex flex-col xs:flex-row xs:space-x-2 gap-2 xs:gap-0">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={customTheme.backgroundColor}
                          onChange={(e) =>
                            handleCustomThemeUpdate(
                              "backgroundColor",
                              e.target.value
                            )
                          }
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          value={customTheme.backgroundColor}
                          onChange={(e) =>
                            handleCustomThemeUpdate(
                              "backgroundColor",
                              e.target.value
                            )
                          }
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Card Background */}
                    <div className="space-y-2">
                      <Label htmlFor="cardBackground">Card Background</Label>
                      <div className="flex flex-col xs:flex-row xs:space-x-2 gap-2 xs:gap-0">
                        <Input
                          id="cardBackground"
                          type="color"
                          value={customTheme.cardBackground}
                          onChange={(e) =>
                            handleCustomThemeUpdate(
                              "cardBackground",
                              e.target.value
                            )
                          }
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          value={customTheme.cardBackground}
                          onChange={(e) =>
                            handleCustomThemeUpdate(
                              "cardBackground",
                              e.target.value
                            )
                          }
                          placeholder="#f8f9fa"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Primary Color */}
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex flex-col xs:flex-row xs:space-x-2 gap-2 xs:gap-0">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={customTheme.primaryColor}
                          onChange={(e) =>
                            handleCustomThemeUpdate(
                              "primaryColor",
                              e.target.value
                            )
                          }
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          value={customTheme.primaryColor}
                          onChange={(e) =>
                            handleCustomThemeUpdate(
                              "primaryColor",
                              e.target.value
                            )
                          }
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex flex-col xs:flex-row xs:space-x-2 gap-2 xs:gap-0">
                        <Input
                          id="textColor"
                          type="color"
                          value={customTheme.textColor}
                          onChange={(e) =>
                            handleCustomThemeUpdate("textColor", e.target.value)
                          }
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          value={customTheme.textColor}
                          onChange={(e) =>
                            handleCustomThemeUpdate("textColor", e.target.value)
                          }
                          placeholder="#374151"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Font Family */}
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <select
                        id="fontFamily"
                        value={customTheme.fontFamily}
                        onChange={(e) =>
                          handleCustomThemeUpdate("fontFamily", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Fira Code">Fira Code</option>
                        <option value="Georgia">Georgia</option>
                      </select>
                    </div>

                    {/* Button Style */}
                    <div className="space-y-2">
                      <Label htmlFor="buttonStyle">Button Style</Label>
                      <select
                        id="buttonStyle"
                        value={customTheme.buttonStyle}
                        onChange={(e) =>
                          handleCustomThemeUpdate("buttonStyle", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="default">Default</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                        <option value="neon">Neon</option>
                        <option value="gradient">Gradient</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={() => handleThemeSelect("custom")}
                      className="w-full sm:flex-1"
                    >
                      Apply Custom Theme
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetToDefault}
                      className="w-full sm:w-auto"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1 min-w-0">
          <div className="lg:sticky lg:top-6">
            <ProfilePreview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemesPage;
