import Mux from "@mux/mux-node";
import { db } from "@/lib/db";

const { video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export const updateMuxAsset = async (chapterId: string) => {
  try {
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { muxData: true },
    });

    const asset = await video.assets.create({
      input: [{ url: chapter?.videoUrl! }],
      playback_policy: ["public"],
    });

    const muxData = await db.muxData.update({
      where: { chapterId: chapter?.id },
      data: {
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id,
      },
    });

    return muxData;
  } catch (error) {
    console.log(["UPDATE_MUX_DATA"], error);
    return null;
  }
};
