export interface BannerDto {
  id: number;
  bannerurl: string;
}

export interface StatsDto {
  solved: number;
  total: number;
}

export interface CalendarEntryDto {
  date: number;
  solved: boolean;
  count: number;
}

export interface ListPageDataResponseDto {
  banners: BannerDto[];
  stats: StatsDto;
  calendar: CalendarEntryDto[];
}

