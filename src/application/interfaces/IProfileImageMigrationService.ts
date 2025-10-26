

export interface IProfileImageMigrationService {
  migrateOAuthProfileImage(profileImageUrl: string, userId: string): Promise<string>;
}