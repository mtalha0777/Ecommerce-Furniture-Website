import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  Container,
  Avatar,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  TextField,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  AddAPhoto,
  Delete,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
};

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", avatar_url: "" });
  const [favorites, setFavorites] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const theme = {
    background: "#F5EFE6",
    containerBackground: "#FFFFFF",
    primaryText: "#5D4037",
    secondaryText: "#8D6E63",
    accent: "#8D6E63",
    lightBorder: "#D7CCC8",
  };

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: favoritesData, error: favoritesError } = await supabase
        .from("wishlist_items")
        .select("*, products(*)")
        .eq("user_id", user.id);
      if (favoritesError) throw favoritesError;
      setFavorites(favoritesData);
    } catch (error) {
      toast.error("Failed to load profile data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: profile.name })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    }
    setIsUpdating(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUpdating(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `user_profile_pics/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product_images")
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes("permission denied")) {
        toast.error("Permission Denied! Check your storage policies.");
      } else {
        toast.error("Failed to upload image: " + uploadError.message);
      }
      console.error(uploadError);
      setIsUpdating(false);
      return;
    }

    const { data } = supabase.storage
      .from("product_images")
      .getPublicUrl(filePath);
    const newAvatarUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl })
      .eq("id", user.id);
    if (updateError) {
      toast.error("Failed to update profile picture.");
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: newAvatarUrl }));
      toast.success("Profile picture updated!");
    }
    setIsUpdating(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8)
      return toast.error("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match.");

    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsUpdating(false);
  };

  const handleDeleteFavorite = async (favoriteId) => {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", favoriteId);
    if (error) toast.error("Failed to remove favorite.");
    else {
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
      toast.success("Removed from wishlist.");
    }
  };

  const styles = {
    page: {
      backgroundColor: theme.background,
      minHeight: "100vh",
      padding: isMobile ? "15px" : "30px",
    },
    card: {
      backgroundColor: theme.containerBackground,
      borderRadius: "15px",
      padding: isMobile ? "20px" : "30px",
      marginBottom: "30px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
  };

  if (loading) return <Typography>Loading Profile...</Typography>;

  return (
    <Box sx={styles.page}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ color: theme.primaryText, textAlign: "center", mb: 4 }}
        >
          My Profile
        </Typography>

        <Box sx={styles.card}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={profile.avatar_url}
                sx={{ width: 100, height: 100 }}
              />
              <IconButton
                onClick={() => fileInputRef.current.click()}
                disabled={isUpdating}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.accent,
                  color: "white",
                  "&:hover": { backgroundColor: theme.primaryText },
                }}
              >
                <AddAPhoto />
              </IconButton>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                hidden
                accept="image/*"
              />
            </Box>

            <Box sx={{ flex: 1, width: "100%" }}>
              {isEditingProfile ? (
                <>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleProfileUpdate}
                      disabled={isUpdating}
                      sx={{ backgroundColor: theme.accent }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="h5" sx={{ color: theme.primaryText }}>
                    {profile.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.secondaryText }}
                  >
                    {user?.email}
                  </Typography>
                  <Button
                    variant="text"
                    startIcon={<Edit />}
                    onClick={() => setIsEditingProfile(true)}
                    sx={{ mt: 1, color: theme.accent }}
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={styles.card}>
          <Typography variant="h5" sx={{ color: theme.primaryText, mb: 3 }}>
            Update Your Password
          </Typography>
          <form onSubmit={handlePasswordUpdate}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isUpdating}
                  sx={{ backgroundColor: theme.accent }}
                >
                  Update Password
                </Button>
              </Box>
            </Box>
          </form>
        </Box>

        <Box sx={styles.card}>
          <Typography variant="h5" sx={{ color: theme.primaryText, mb: 3 }}>
            My Wishlist
          </Typography>
          <Grid container spacing={3}>
            {favorites.length === 0 ? (
              <Grid item xs={12}>
                <Typography sx={{ width: "100%", textAlign: "center", p: 4 }}>
                  Your wishlist is empty.
                </Typography>
              </Grid>
            ) : (
              favorites.map((fav) => (
                <Grid item xs={12} sm={6} md={4} key={fav.id}>
                  <Card sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="150"
                      image={fav.products.image_urls[0]}
                      alt={fav.products.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{fav.products.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rs. {fav.products.price}
                      </Typography>
                    </CardContent>
                    <IconButton
                      onClick={() => handleDeleteFavorite(fav.id)}
                      sx={{ position: "absolute", top: 5, right: 5 }}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default UserProfile;
