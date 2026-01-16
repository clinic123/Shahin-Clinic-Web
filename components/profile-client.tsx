"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient, useSession } from "@/lib/auth-client";
import {
  AlertCircle,
  Bell,
  Camera,
  CheckCircle,
  Key,
  Mail,
  Phone,
  Save,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ProfileClient() {
  const { data: session } = useSession();
  const { updateUser } = authClient;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const user = session?.user;

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
  });

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    setImageLoading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Update user profile with new image URL
      const updateResult = await updateUser({
        image: result.secure_url,
      });

      if (updateResult.error) {
        throw new Error(
          updateResult.error.message || "Failed to update profile image"
        );
      }

      toast.success("Profile image updated successfully!", {
        icon: <CheckCircle className="h-4 w-4" />,
      });

      // Clear preview after successful upload
      setPreviewImage(null);
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      setPreviewImage(null);
    } finally {
      setImageLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove profile image
  const handleRemoveImage = async () => {
    setImageLoading(true);
    try {
      const updateResult = await updateUser({
        image: null,
      });

      if (updateResult.error) {
        throw new Error(
          updateResult.error.message || "Failed to remove profile image"
        );
      }

      toast.success("Profile image removed successfully!", {
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to remove image", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setImageLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUser({
        name: profileData.name,
        phoneNumber: profileData.phone,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to update profile", {
          icon: <AlertCircle className="h-4 w-4" />,
        });
      } else {
        toast.success("Profile updated successfully!", {
          icon: <CheckCircle className="h-4 w-4" />,
        });
      }
    } catch (error) {
      toast.error("Failed to update profile", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await authClient.changePassword({
        newPassword: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(error.message || "Failed to change password", {
          icon: <AlertCircle className="h-4 w-4" />,
        });
      } else {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Password changed successfully!", {
          icon: <CheckCircle className="h-4 w-4" />,
        });
      }
    } catch (error) {
      toast.error("Failed to change password", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setLoading(true);
    try {
      // Update settings in your database
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Settings updated successfully!", {
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (error) {
      toast.error("Failed to update settings", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "doctor":
        return "default";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  const currentImage = previewImage || user?.image;

  useEffect(() => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
    });
  }, [session?.user]);

  console.log(session?.user);
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={currentImage || ""} alt={user?.name} />
                      <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                        {getInitials(user?.name || "User")}
                      </AvatarFallback>
                    </Avatar>

                    {/* Image Upload Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </div>

                    {/* Upload Button */}
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageLoading}
                    >
                      {imageLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Remove Image Button (only show if user has an image) */}
                    {user?.image && !previewImage && (
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full"
                        variant="destructive"
                        onClick={handleRemoveImage}
                        disabled={imageLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{user?.name}</h3>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                    <Badge
                      variant={getRoleBadgeVariant(user?.role || "")}
                      className="mt-1"
                    >
                      {user?.role?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="w-full pt-4 border-t">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Member since</span>
                        <span className="font-medium">
                          {new Date(
                            user?.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Appointments</span>
                        <span className="font-medium">12</span>
                      </div>
                    </div>
                  </div>

                  {/* Upload Instructions */}
                  <div className="text-xs text-gray-500 text-center">
                    <p>Click the camera icon to upload a new profile picture</p>
                    <p>Max size: 5MB • Supported: JPG, PNG, WebP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                email: e.target.value,
                              })
                            }
                            placeholder="Enter your email"
                            disabled // Email might be managed by auth system
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                    <CardDescription>
                      Your account details and membership information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-500">
                            User ID
                          </Label>
                          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                            {user?.id}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-500">
                            Account Role
                          </Label>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getRoleBadgeVariant(user?.role || "")}
                            >
                              {user?.role?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-500">
                            Member Since
                          </Label>
                          <p className="text-sm">
                            {new Date(
                              user?.createdAt || Date.now()
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-500">
                            Last Updated
                          </Label>
                          <p className="text-sm">
                            {new Date(
                              user?.updatedAt || Date.now()
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Enter current password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Enter new password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirm new password"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label htmlFor="twoFactor" className="text-base">
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-gray-600">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label htmlFor="session" className="text-base">
                            Active Sessions
                          </Label>
                          <p className="text-sm text-gray-600">
                            Manage your active login sessions
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Sessions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label
                            htmlFor="emailNotifications"
                            className="text-base"
                          >
                            Email Notifications
                          </Label>
                          <p className="text-sm text-gray-600">
                            Receive appointment reminders and updates via email
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex  sr-only items-center justify-between">
                        <div className="space-y-1">
                          <Label
                            htmlFor="smsNotifications"
                            className="text-base"
                          >
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-gray-600">
                            Receive text message reminders for appointments
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          disabled
                          id="smsNotifications"
                          checked={settings.smsNotifications}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              smsNotifications: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label
                            htmlFor="appointmentReminders"
                            className="text-base"
                          >
                            Appointment Reminders
                          </Label>
                          <p className="text-sm text-gray-600">
                            Get reminded about upcoming appointments
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="appointmentReminders"
                          checked={settings.appointmentReminders}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              appointmentReminders: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleSettingsUpdate}
                          disabled={loading}
                          className="flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Preferences
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
