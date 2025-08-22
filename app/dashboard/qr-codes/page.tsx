"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, QrCode, Share, Copy, Eye } from "lucide-react";
import QRCode from "qrcode";
import { useLinksStore } from "@/stores/linksStore";
import { useUserStore } from "@/stores/userStore";
import { availableIcons } from "@/lib/icons";

const QRCodePage = () => {
  const { toast } = useToast();
  const { links } = useLinksStore();
  const { user } = useUserStore();
  const [selectedType, setSelectedType] = useState<"profile" | "link">(
    "profile"
  );
  const [selectedLinkId, setSelectedLinkId] = useState<string>("");
  const [qrData, setQrData] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [customizations, setCustomizations] = useState({
    size: 256,
    darkColor: "#000000",
    lightColor: "#ffffff",
    errorCorrectionLevel: "M" as "L" | "M" | "Q" | "H",
  });

  const generateQRCode = async () => {
    try {
      let url = "";
      if (selectedType === "profile") {
        url = `${window.location.origin}/${user?.username}`; // In real app, use actual username
      } else if (selectedLinkId) {
        const selectedLink = links.find((link) => link.id === selectedLinkId);
        if (selectedLink) {
          url = selectedLink.url;
        }
      }

      if (!url) {
        toast({
          title: "Error",
          description: "Please select a valid option to generate QR code",
          variant: "destructive",
        });
        return;
      }

      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: customizations.size,
        color: {
          dark: customizations.darkColor,
          light: customizations.lightColor,
        },
        errorCorrectionLevel: customizations.errorCorrectionLevel,
        margin: 2,
      });

      setQrCodeUrl(qrCodeDataUrl);
      setQrData(url);

      toast({
        title: "QR Code Generated",
        description: "Your QR code is ready to download and share!",
      });
    } catch (error) {
      console.error("QR Code generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `qr-code-${
      selectedType === "profile" ? "profile" : "link"
    }.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: "Download Started",
      description: "Your QR code has been downloaded successfully!",
    });
  };

  const copyToClipboard = async () => {
    if (!qrData) return;

    try {
      await navigator.clipboard.writeText(qrData);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      console.error("Clipboard copy error:", error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareQRCode = async () => {
    if (!qrData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out my links!",
          url: qrData,
        });
      } catch (error) {
        console.error("Share QR Code error:", error);
        // User cancelled sharing
      }
    } else {
      copyToClipboard();
    }
  };

  useEffect(() => {
    if (selectedType === "profile") {
      generateQRCode();
    }
  }, [selectedType, customizations]);

  useEffect(() => {
    if (selectedType === "link" && selectedLinkId) {
      generateQRCode();
    }
  }, [selectedLinkId]);

  return (
    <div className="space-y-4 md:space-y-6 md:p-0 mb-16">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          QR Code Generator
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Create QR codes for your profile and links to share offline
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Settings
              </CardTitle>
              <CardDescription>
                Configure what your QR code should link to
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* QR Type */}
              <div className="space-y-2">
                <Label htmlFor="type">QR Code Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value: "profile" | "link") =>
                    setSelectedType(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select QR code type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profile">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        My Profile Page
                      </div>
                    </SelectItem>
                    <SelectItem value="link">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Specific Link
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select Link */}
              {selectedType === "link" && (
                <div className="space-y-2">
                  <Label htmlFor="link">Select Link</Label>
                  <Select
                    value={selectedLinkId}
                    onValueChange={setSelectedLinkId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a link" />
                    </SelectTrigger>
                    <SelectContent>
                      {links.map((link) => (
                        <SelectItem key={link.id} value={link.id}>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs shrink-0">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg">
                                {availableIcons[
                                  link.icon as keyof typeof availableIcons
                                ] ? (
                                  React.createElement(
                                    availableIcons[
                                      link.icon as keyof typeof availableIcons
                                    ],
                                    {
                                      className: "h-5 w-5",
                                      style: { color: link.color ?? "#000" },
                                    }
                                  )
                                ) : (
                                  // fallback if it's an emoji or custom string
                                  <span style={{ color: link.color ?? "#000" }}>
                                    {link.icon}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium">{link.title}</div>
                              <div className="text-xs text-muted-foreground break-all">
                                {link.url}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Customization */}
              <div className="space-y-4">
                <h4 className="font-medium">Customization</h4>

                {/* Size & Error Correction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size (px)</Label>
                    <Select
                      value={customizations.size.toString()}
                      onValueChange={(value) =>
                        setCustomizations((prev) => ({
                          ...prev,
                          size: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128px</SelectItem>
                        <SelectItem value="256">256px</SelectItem>
                        <SelectItem value="512">512px</SelectItem>
                        <SelectItem value="1024">1024px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="error-correction">Error Correction</Label>
                    <Select
                      value={customizations.errorCorrectionLevel}
                      onValueChange={(value: "L" | "M" | "Q" | "H") =>
                        setCustomizations((prev) => ({
                          ...prev,
                          errorCorrectionLevel: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dark-color">Foreground Color</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="color"
                        value={customizations.darkColor}
                        onChange={(e) =>
                          setCustomizations((prev) => ({
                            ...prev,
                            darkColor: e.target.value,
                          }))
                        }
                        className="w-12 h-10 rounded-lg border-0 p-0 cursor-pointer"
                      />
                      <Input
                        value={customizations.darkColor}
                        onChange={(e) =>
                          setCustomizations((prev) => ({
                            ...prev,
                            darkColor: e.target.value,
                          }))
                        }
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="light-color">Background Color</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="color"
                        value={customizations.lightColor}
                        onChange={(e) =>
                          setCustomizations((prev) => ({
                            ...prev,
                            lightColor: e.target.value,
                          }))
                        }
                        className="w-12 h-10 rounded-lg border-2 md:border-0 p-0 cursor-pointer"
                      />
                      <Input
                        value={customizations.lightColor}
                        onChange={(e) =>
                          setCustomizations((prev) => ({
                            ...prev,
                            lightColor: e.target.value,
                          }))
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={generateQRCode} className="w-full">
                Generate QR Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Your generated QR code will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-center p-6 bg-muted/30 rounded-lg">
                    <img
                      src={qrCodeUrl}
                      alt="Generated QR Code"
                      className="max-w-full h-auto rounded border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={qrData}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={downloadQRCode} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={shareQRCode}
                      className="sm:w-auto"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(qrData, "_blank")}
                      className="sm:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <QrCode className="h-12 w-12 mb-4 opacity-50" />
                  <p>
                    Configure your settings and click &quot;Generate QR
                    Code&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  1
                </Badge>
                <div>
                  <p className="font-medium">Business Cards</p>
                  <p className="text-sm text-muted-foreground">
                    Add QR codes to business cards for instant link sharing
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  2
                </Badge>
                <div>
                  <p className="font-medium">Social Media</p>
                  <p className="text-sm text-muted-foreground">
                    Share QR codes in your stories or posts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  3
                </Badge>
                <div>
                  <p className="font-medium">Print Materials</p>
                  <p className="text-sm text-muted-foreground">
                    Include on flyers, posters, and marketing materials
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
