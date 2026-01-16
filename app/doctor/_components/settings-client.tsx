"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  useDoctor,
  useUpdateDoctor,
  useUploadProfileImage,
  type DoctorFormData,
} from "@/hooks/useDoctors";
import { authClient } from "@/lib/auth-client";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Facebook,
  Instagram,
  Key,
  Linkedin,
  Lock,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Twitter,
  UserIcon,
  Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface SocialLinks {
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// You need to get the doctor ID - this could come from props, context, or a hook
interface DoctorSettingsPageProps {
  userId: string;
}

export default function DoctorSettingsPage({
  userId,
}: DoctorSettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use reusable hooks with the doctor ID
  const { data, isLoading, error } = useDoctor(userId);
  const updateMutation = useUpdateDoctor();
  const uploadImageMutation = useUploadProfileImage();
  const [loading, setLoading] = useState(false);

  const doctor = data?.doctor;

  // Form states
  const [profileData, setProfileData] = useState<DoctorFormData>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    specialization: "",
    department: doctor?.department || "",
    experience: 0,
    education: "",
    consultationFee: 0,
    availableDays: [],
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebookUrl: doctor?.facebookUrl || "",
    twitterUrl: doctor?.twitterUrl || "",
    youtubeUrl: doctor?.youtubeUrl || "",
    linkedinUrl: doctor?.linkedinUrl || "",
    instagramUrl: doctor?.instagramUrl || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update form data when doctor data loads
  useEffect(() => {
    if (doctor) {
      setProfileData({
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        bio: doctor.bio || "",
        specialization: doctor.specialization,
        department: doctor.department,
        experience: doctor.experience,
        education: doctor.education,
        consultationFee: doctor.consultationFee,
        availableDays: doctor.availableDays || [],
      });

      setSocialLinks({
        facebookUrl: doctor.facebookUrl || "",
        twitterUrl: doctor.twitterUrl || "",
        youtubeUrl: doctor.youtubeUrl || "",
        linkedinUrl: doctor.linkedinUrl || "",
        instagramUrl: doctor.instagramUrl || "",
      });
    }
  }, [doctor]);

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !doctor) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      await uploadImageMutation.mutateAsync({ file, doctorId: doctor.id });
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    await updateMutation.mutateAsync({
      id: doctor.id,
      data: profileData,
    });
  };

  const handleSocialLinksUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    await updateMutation.mutateAsync({
      id: doctor.id,
      data: socialLinks,
    });
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

  const toggleAvailableDay = (day: string) => {
    setProfileData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const isUpdating = updateMutation.isPending || uploadImageMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading profile: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!doctor) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Doctor profile not found. Please complete your profile setup.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:max-w-xl">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal and professional information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                    <AvatarFallback className="text-lg">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    onClick={handleProfileImageClick}
                    disabled={isUpdating}
                  >
                    {uploadImageMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the camera icon to upload a new photo
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={profileData.specialization}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          specialization: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>

                    <Select
                      defaultValue={doctor.department}
                      value={profileData.department}
                      onValueChange={(value) =>
                        setProfileData((prev) => ({
                          ...prev,
                          department: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Change department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                        <SelectItem value="Radiology">Radiology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={profileData.experience}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          experience: parseInt(e.target.value) || 0,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={profileData.education}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          education: e.target.value,
                        }))
                      }
                      placeholder="e.g., MD, MBBS, PhD"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultationFee">
                      Consultation Fee ($)
                    </Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={profileData.consultationFee}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          consultationFee: parseFloat(e.target.value) || 0,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <RichTextEditor
                    value={profileData.bio || ""}
                    onChange={(val: string) =>
                      setProfileData((prev) => ({
                        ...prev,
                        bio: val,
                      }))
                    }
                    placeholder="Tell us about your medical background, specialties, and approach to patient care..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full md:w-auto"
                >
                  {updateMutation.isPending && (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Add your social media profiles to connect with patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSocialLinksUpdate} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="facebook">Facebook Profile URL</Label>
                      <Input
                        id="facebook"
                        type="url"
                        placeholder="https://facebook.com/yourprofile"
                        value={socialLinks.facebookUrl}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            facebookUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="twitter">Twitter Profile URL</Label>
                      <Input
                        id="twitter"
                        type="url"
                        placeholder="https://twitter.com/yourprofile"
                        value={socialLinks.twitterUrl}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            twitterUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Youtube className="h-5 w-5 text-red-600" />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="youtube">YouTube Channel URL</Label>
                      <Input
                        id="youtube"
                        type="url"
                        placeholder="https://youtube.com/yourchannel"
                        value={socialLinks.youtubeUrl}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            youtubeUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={socialLinks.linkedinUrl}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            linkedinUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="instagram">Instagram Profile URL</Label>
                      <Input
                        id="instagram"
                        type="url"
                        placeholder="https://instagram.com/yourprofile"
                        value={socialLinks.instagramUrl}
                        onChange={(e) =>
                          setSocialLinks((prev) => ({
                            ...prev,
                            instagramUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full md:w-auto"
                >
                  {updateMutation.isPending && (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Update Social Links
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
              <CardDescription>
                Set your available days for appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <Badge
                      key={day}
                      variant={
                        profileData.availableDays.includes(day)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer px-3 py-1"
                      onClick={() => toggleAvailableDay(day)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Click on days to toggle availability
                </p>
              </div>

              <Button
                onClick={() => {
                  if (doctor) {
                    updateMutation.mutate({
                      id: doctor.id,
                      data: { availableDays: profileData.availableDays },
                    });
                  }
                }}
                disabled={isUpdating}
                className="w-full md:w-auto"
              >
                {updateMutation.isPending && (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                )}
                <Save className="h-4 w-4 mr-2" />
                Update Availability
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <Label htmlFor="currentPassword">Current Password</Label>
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
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
      </Tabs>
    </div>
  );
}
