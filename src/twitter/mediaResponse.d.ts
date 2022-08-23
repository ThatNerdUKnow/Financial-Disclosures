export type MediaResponse = {
  media_id: number;
  media_id_string: string;
  media_key: string;
  size: number;
  expires_after_secs: number;
  image: twitterImage;
};

type twitterImage = {
  image_type: string;
  w: number;
  h: number;
};
