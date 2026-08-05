// Egern replacement for the small Map Local responses in BiliUniverse ADBlock.

function isPauseAdUrl(url) {
  return /\/(?:[^/?]+\/)*(?:pause|paused|pause_page|paused_page|pausedpage|pause_ad|ad_pause)(?:\/|\?|$)/i.test(url);
}

export function responseForUrl(url) {
  if (isPauseAdUrl(url)) {
    // BBZQ blocks the paused-page request before the Android ad panel is built.
    // A successful empty general response gives the client the same no-panel
    // result without failing the surrounding video-detail request.
    return { code: 0, message: "0", data: {} };
  }
  if (/\/pgc\/activity\/deliver\/material\/receive\?/i.test(url)) {
    return {
      code: 0,
      data: { closeType: "close_win", container: [], showTime: "" },
      message: "success",
    };
  }
  return {};
}

export default function main(context) {
  const url = String(context?.request?.url || "");
  return {
    response: {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(responseForUrl(url)),
    },
  };
}
