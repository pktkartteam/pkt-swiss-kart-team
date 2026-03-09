"use client";

import * as React from "react";
import Image from "next/image";
import { Box, Card, CardActionArea } from "@mui/material";
import s from "./PilotCard.module.scss";
import { Pilot } from "@/types/types";

export default function PilotCard({ pilot }: { pilot: Pilot }) {
  return (
    <Card className={s.card} elevation={0}>
      <CardActionArea className={s.cardAction}>
        <Box className={s.mediaWrap}>
          {pilot.photoUrl ? (
            <Image
              src={pilot.photoUrl}
              alt={pilot.name}
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
              className={s.media}
              unoptimized
            />
          ) : (
            <div className={s.mediaPlaceholder}>
              <span className={s.placeholderText}>Foto in arrivo</span>
            </div>
          )}

          <div className={s.mediaOverlay} />

          <div className={s.overlayContent}>
            <div className={s.badges}>
              <span className={s.tag}>{pilot.category}</span>
            </div>

            <div className={s.bottom}>
              <div className={s.name}>{pilot.name}</div>
              <div className={s.underline} />
            </div>
          </div>
        </Box>
      </CardActionArea>
    </Card>
  );
}
