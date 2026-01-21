"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { CVData, Experience, Project, Education } from "@/lib/types";
import {
  getUserProfile,
  updateProfileItem,
  addProfileItem,
  deleteProfileItem,
  type SectionType,
  type ProfileData,
} from "@/actions/profile-actions";

// Cache key per architecture
const CACHE_KEY = "align-ai:profile:cache";
const CACHE_TTL = 3600000; // 1 hour

interface CachedProfile {
  data: ProfileData;
  timestamp: number;
}

// Cache helpers
function cacheProfile(profile: ProfileData) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: profile,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    // localStorage might be full or disabled
    console.warn("Failed to cache profile:", e);
  }
}

function getCachedProfile(): ProfileData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp }: CachedProfile = JSON.parse(cached);
    // Cache valid for 1 hour
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore
  }
}

export interface UseProfileReturn {
  profile: ProfileData | null;
  cvData: CVData | null;
  isLoading: boolean;
  error: string | null;

  // Experience operations
  updateExperience: (index: number, updates: Partial<Experience>) => Promise<void>;
  addExperience: () => Promise<void>;
  deleteExperience: (index: number) => Promise<void>;

  // Project operations
  updateProject: (index: number, updates: Partial<Project>) => Promise<void>;
  addProject: () => Promise<void>;
  deleteProject: (index: number) => Promise<void>;

  // Education operations
  updateEducation: (index: number, updates: Partial<Education>) => Promise<void>;
  addEducation: () => Promise<void>;
  deleteEducation: (index: number) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Optimistic state for cvData
  const [optimisticCvData, setOptimisticCvData] = useState<CVData | null>(null);

  // Get actual cvData (optimistic if available, otherwise from profile)
  const cvData = optimisticCvData ?? profile?.cvData ?? null;

  // Load profile
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try cache first for immediate display
      const cached = getCachedProfile();
      if (cached) {
        setProfile(cached);
        setOptimisticCvData(cached.cvData);
      }

      // Fetch from server
      const result = await getUserProfile();
      if (result.success && result.profile) {
        setProfile(result.profile);
        setOptimisticCvData(result.profile.cvData);
        cacheProfile(result.profile);
      } else if (!result.success) {
        setError(result.error || "Erreur de chargement");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Generic optimistic update helper
  const optimisticUpdate = useCallback(
    async <T>(
      section: SectionType,
      operation: "update" | "add" | "delete",
      index: number,
      updates?: Partial<T>,
      newItem?: T
    ) => {
      if (!cvData) return;

      // Store previous state for rollback
      const previousCvData = { ...cvData };

      // Apply optimistic update
      const sectionData = [...((cvData[section] as unknown[]) || [])];

      switch (operation) {
        case "update":
          if (updates && index >= 0 && index < sectionData.length) {
            sectionData[index] = { ...(sectionData[index] as object), ...(updates as object) };
          }
          break;
        case "add":
          if (newItem) {
            sectionData.push(newItem);
          }
          break;
        case "delete":
          if (index >= 0 && index < sectionData.length) {
            sectionData.splice(index, 1);
          }
          break;
      }

      setOptimisticCvData({
        ...cvData,
        [section]: sectionData,
      });

      // Execute server action
      let result: { success: boolean; error?: string };

      try {
        switch (operation) {
          case "update":
            result = await updateProfileItem(section, index, updates || {});
            break;
          case "add":
            result = await addProfileItem(section, newItem);
            break;
          case "delete":
            result = await deleteProfileItem(section, index);
            break;
          default:
            result = { success: false, error: "Operation inconnue" };
        }

        if (!result.success) {
          // Rollback on error
          setOptimisticCvData(previousCvData);
          toast.error(result.error || "Erreur de sauvegarde");
        } else {
          // Update cache on success
          if (profile) {
            const updatedProfile = {
              ...profile,
              cvData: {
                ...cvData,
                [section]: sectionData,
              },
            };
            cacheProfile(updatedProfile);
          }
        }
      } catch (err) {
        // Rollback on exception
        setOptimisticCvData(previousCvData);
        toast.error("Erreur de connexion");
        throw err;
      }
    },
    [cvData, profile]
  );

  // Experience operations
  const updateExperience = useCallback(
    async (index: number, updates: Partial<Experience>) => {
      await optimisticUpdate<Experience>("experiences", "update", index, updates);
    },
    [optimisticUpdate]
  );

  const addExperience = useCallback(async () => {
    const newExperience: Experience = {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [],
    };
    await optimisticUpdate<Experience>("experiences", "add", -1, undefined, newExperience);
    toast.success("Experience ajoutee");
  }, [optimisticUpdate]);

  const deleteExperience = useCallback(
    async (index: number) => {
      await optimisticUpdate<Experience>("experiences", "delete", index);
      toast.success("Experience supprimee");
    },
    [optimisticUpdate]
  );

  // Project operations
  const updateProject = useCallback(
    async (index: number, updates: Partial<Project>) => {
      await optimisticUpdate<Project>("projects", "update", index, updates);
    },
    [optimisticUpdate]
  );

  const addProject = useCallback(async () => {
    const newProject: Project = {
      name: "",
      description: "",
      techStack: [],
      year: new Date().getFullYear().toString(),
    };
    await optimisticUpdate<Project>("projects", "add", -1, undefined, newProject);
    toast.success("Projet ajoute");
  }, [optimisticUpdate]);

  const deleteProject = useCallback(
    async (index: number) => {
      await optimisticUpdate<Project>("projects", "delete", index);
      toast.success("Projet supprime");
    },
    [optimisticUpdate]
  );

  // Education operations
  const updateEducation = useCallback(
    async (index: number, updates: Partial<Education>) => {
      await optimisticUpdate<Education>("education", "update", index, updates);
    },
    [optimisticUpdate]
  );

  const addEducation = useCallback(async () => {
    const newEducation: Education = {
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
    };
    await optimisticUpdate<Education>("education", "add", -1, undefined, newEducation);
    toast.success("Formation ajoutee");
  }, [optimisticUpdate]);

  const deleteEducation = useCallback(
    async (index: number) => {
      await optimisticUpdate<Education>("education", "delete", index);
      toast.success("Formation supprimee");
    },
    [optimisticUpdate]
  );

  // Refresh
  const refresh = useCallback(async () => {
    clearCache();
    await loadProfile();
  }, [loadProfile]);

  return {
    profile,
    cvData,
    isLoading,
    error,
    updateExperience,
    addExperience,
    deleteExperience,
    updateProject,
    addProject,
    deleteProject,
    updateEducation,
    addEducation,
    deleteEducation,
    refresh,
  };
}
