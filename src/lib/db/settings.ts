import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSettings } from "../types";
import { DEFAULT_WEEKLY_TARGET } from "../types";

type SettingsRow = {
  user_id: string;
  weekly_apply_target: number;
  preferred_model: string;
};

const defaults = (): AppSettings => ({
  weeklyApplyTarget: DEFAULT_WEEKLY_TARGET,
  preferredModel: "gemini-2.0-flash",
});

export async function getSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const d = defaults();
    const { error: bootError } = await supabase.from("user_settings").insert({
      user_id: userId,
      weekly_apply_target: d.weeklyApplyTarget,
      preferred_model: d.preferredModel,
    });
    if (bootError) throw bootError;
    return d;
  }

  const row = data as SettingsRow;
  return {
    weeklyApplyTarget: row.weekly_apply_target,
    preferredModel: row.preferred_model,
  };
}

export async function saveSettings(
  supabase: SupabaseClient,
  userId: string,
  settings: AppSettings
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      weekly_apply_target: settings.weeklyApplyTarget,
      preferred_model: settings.preferredModel,
    })
    .select()
    .single();

  if (error) throw error;
  const row = data as SettingsRow;
  return {
    weeklyApplyTarget: row.weekly_apply_target,
    preferredModel: row.preferred_model,
  };
}
