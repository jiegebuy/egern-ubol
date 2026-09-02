// Generated from official uBO Lite 2026.901.1442.
// Query-only transforms without initiator/domain-type conditions are included.

const OPS = [
  {"d":["aboutamazon.com","amazon.ae","amazon.ca","amazon.cn","amazon.co.jp","amazon.co.uk","amazon.com","amazon.com.au","amazon.de","amazon.es","amazon.fr","amazon.in","amazon.nl","amazon.sg","amzn.to"],"p":["asc_campaign"]},
  {"d":["aboutamazon.com","amazon.ae","amazon.ca","amazon.cn","amazon.co.jp","amazon.co.uk","amazon.com","amazon.com.au","amazon.de","amazon.es","amazon.fr","amazon.in","amazon.nl","amazon.sg","amzn.to"],"p":["asc_refurl"]},
  {"d":["aboutamazon.com","amazon.ae","amazon.ca","amazon.cn","amazon.co.jp","amazon.co.uk","amazon.com","amazon.com.au","amazon.de","amazon.es","amazon.fr","amazon.in","amazon.nl","amazon.sg","amzn.to"],"p":["asc_source"]},
  {"d":["adsninja.ca"],"p":["url"]},
  {"d":["adultswim-vodlive.cdn.turner.com"],"p":["caid"]},
  {"d":["adultswim-vodlive.cdn.turner.com"],"p":["yo.ap"]},
  {"d":["adultswim-vodlive.cdn.turner.com"],"p":["yo.asd"]},
  {"d":["adultswim-vodlive.cdn.turner.com"],"p":["yo.po"]},
  {"d":["adultswim.com"],"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?medium\\.ngtv\\.io/v2/media/.*(?:[^A-Za-z0-9_.%\\-]|$)ssaiProfile=","p":["ssaiProfile"]},
  {"d":["adweek.com"],"p":["traffic_source"]},
  {"d":["amazon.ae","amazon.ca","amazon.cn","amazon.co.jp","amazon.co.uk","amazon.com","amazon.com.au","amazon.de","amazon.es","amazon.fr","amazon.in","amazon.nl","amazon.sg"],"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?amazon\\..*/dp/.*(?:[^A-Za-z0-9_.%\\-]|$)ref_=","p":["ref_"]},
  {"d":["aternos.org","htlb.casalemedia.com"],"p":["r"]},
  {"d":["brightcove.com","player.stv.tv"],"p":["ad_config_id"]},
  {"d":["control.kochava.com"],"p":["_rt"]},
  {"d":["control.kochava.com"],"p":["device_id"]},
  {"d":["control.kochava.com"],"p":["ftag"]},
  {"d":["control.kochava.com"],"p":["ko_exchange"]},
  {"d":["control.kochava.com"],"p":["network_id"]},
  {"d":["control.kochava.com"],"p":["site_id"]},
  {"d":["facebook.com"],"p":["mibextid"]},
  {"d":["facebook.com"],"p":["rdid"]},
  {"d":["facebook.com"],"p":["share_url"]},
  {"d":["go.xlirdr.com"],"q":true},
  {"d":["instagram.com","threads.net"],"p":["igshid"]},
  {"d":["instagram.com"],"p":["ig_rid"]},
  {"d":["msn.com"],"p":["cvid"]},
  {"d":["msn.com"],"p":["ei"]},
  {"d":["msn.com"],"p":["ocid"]},
  {"d":["msn.com"],"p":["pc"]},
  {"d":["msn.com"],"p":["vid"]},
  {"d":["open.spotify.com","youtu.be"],"p":["si"]},
  {"d":["open.spotify.com"],"p":["referral"]},
  {"d":["reddit.com"],"p":["correlation_id"]},
  {"d":["reddit.com"],"p":["ref"]},
  {"d":["reddit.com"],"p":["ref_campaign"]},
  {"d":["reddit.com"],"p":["ref_source"]},
  {"d":["reddit.com"],"p":["utm_content"]},
  {"d":["redsky.target.com"],"p":["include_sponsored"]},
  {"d":["sextgem.com"],"p":["id"]},
  {"d":["sonar.viously.com"],"p":["c"]},
  {"d":["sonar.viously.com"],"p":["r"]},
  {"d":["twitter.com","x.com"],"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?com/.*/status/","p":["t"]},
  {"d":["twitter.com","x.com"],"p":["cxt"]},
  {"d":["twitter.com","x.com"],"p":["ref_src"]},
  {"d":["twitter.com","x.com"],"p":["ref_url"]},
  {"d":["twitter.com","x.com"],"p":["refsrc"]},
  {"d":["twitter.com","x.com"],"p":["s"]},
  {"d":["wuzhuiso.com"],"p":["src"]},
  {"d":["youtu.be"],"p":["is"]},
  {"d":["youtube.com"],"p":["pp"]},
  {"d":["zhihu.com"],"p":["hybrid_search_extra"]},
  {"d":["zhihu.com"],"p":["hybrid_search_source"]},
  {"f":"://youtube\\.com/@.*\\?si=","p":["si"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)eid0=","p":["eid0"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)eit0=","p":["eit0"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)experienceActionId=","p":["experienceActionId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)experienceId=","p":["experienceId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)media=","p":["media"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)prnd=","p":["prnd"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)rnd=","p":["rnd"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)sid=","p":["sid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)trackingId=","p":["trackingId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)usi=","p":["usi"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data(?:[^A-Za-z0-9_.%\\-]|$).*(?:[^A-Za-z0-9_.%\\-]|$)widgetId=","p":["widgetId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data\\?.*(?:[^A-Za-z0-9_.%\\-]|$)experienceActionId=","p":["experienceActionId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data\\?.*(?:[^A-Za-z0-9_.%\\-]|$)experienceId=","p":["experienceId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sid=","p":["sid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data\\?.*(?:[^A-Za-z0-9_.%\\-]|$)trackingId=","p":["trackingId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data\\?.*(?:[^A-Za-z0-9_.%\\-]|$)tzo=","p":["tzo"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?api\\.cxense\\.com/public/widget/data\\?.*(?:[^A-Za-z0-9_.%\\-]|$)widgetId=","p":["widgetId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?apps\\.apple\\.com/.*/app/.*referrer","p":["referrer"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?cxm\\-api\\.fifa\\.com/fifaplusweb/api/video/.*(?:[^A-Za-z0-9_.%\\-]|$)adConfig=","p":["adConfig"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?googletagmanager\\.com/gtag/js\\?id=.*(?:[^A-Za-z0-9_.%\\-]|$)cx=","p":["cx"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?googletagmanager\\.com/gtag/js\\?id=.*(?:[^A-Za-z0-9_.%\\-]|$)gtm=","p":["gtm"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?hentaicomics\\.pro/.*\\?code=","p":["code"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?hktvmall\\.com/yuicombo\\?.*(?:[^A-Za-z0-9_.%\\-]|$)/_ui/shared/common/js/analytics/with\\-intersection\\-track\\.js=","p":["/_ui/shared/common/js/analytics/with-intersection-track.js"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?play\\.google\\.com/store/apps/.*referrer","p":["referrer"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.amazon\\..*/page/.*(?:[^A-Za-z0-9_.%\\-]|$)ingress=","p":["ingress"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.amazon\\..*/page/.*(?:[^A-Za-z0-9_.%\\-]|$)lp_context_asin=","p":["lp_context_asin"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.amazon\\..*/page/.*(?:[^A-Za-z0-9_.%\\-]|$)ref_=","p":["ref_"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)_trkparms=","p":["_trkparms"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)amdata=","p":["amdata"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)campid=","p":["campid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)mkcid=","p":["mkcid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)mkevt=","p":["mkevt"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)mkrid=","p":["mkrid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)ssspo=","p":["ssspo"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)sssrc=","p":["sssrc"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.ebay\\..*(?:[^A-Za-z0-9_.%\\-]|$)ssuid=","p":["ssuid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?youtube\\.com/live/.*(?:[^A-Za-z0-9_.%\\-]|$)is=","p":["is"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?youtube\\.com/live/.*(?:[^A-Za-z0-9_.%\\-]|$)si=","p":["si"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?youtube\\.com/post/.*(?:[^A-Za-z0-9_.%\\-]|$)si=","p":["si"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?youtube\\.com/shorts/.*(?:[^A-Za-z0-9_.%\\-]|$)si=","p":["si"]},
  {"p":["__hsfp"]},
  {"p":["__hssc"]},
  {"p":["__hstc"]},
  {"p":["_bhlid"]},
  {"p":["_branch_match_id"]},
  {"p":["_branch_referrer"]},
  {"p":["_gl"]},
  {"p":["_hsenc"]},
  {"p":["_openstat"]},
  {"p":["adjust_adgroup"]},
  {"p":["adjust_campaign"]},
  {"p":["adjust_creative"]},
  {"p":["adjust_tracker"]},
  {"p":["adjust_tracker_limit"]},
  {"p":["adsterra_clid"]},
  {"p":["adsterra_placement_id"]},
  {"p":["at_campaign"]},
  {"p":["at_campaign_type"]},
  {"p":["at_creation"]},
  {"p":["at_emailtype"]},
  {"p":["at_link"]},
  {"p":["at_link_id"]},
  {"p":["at_link_origin"]},
  {"p":["at_link_type"]},
  {"p":["at_medium"]},
  {"p":["at_ptr_name"]},
  {"p":["at_recipient_id"]},
  {"p":["at_recipient_list"]},
  {"p":["at_send_date"]},
  {"p":["bbeml"]},
  {"p":["bsft_aaid"]},
  {"p":["bsft_clkid"]},
  {"p":["bsft_eid"]},
  {"p":["bsft_ek"]},
  {"p":["bsft_mid"]},
  {"p":["bsft_uid"]},
  {"p":["clckid"]},
  {"p":["cx_click"]},
  {"p":["cx_recsOrder"]},
  {"p":["cx_recsWidget"]},
  {"p":["dclid"]},
  {"p":["et_rid"]},
  {"p":["fb_action_ids"]},
  {"p":["fb_action_types"]},
  {"p":["fb_comment_id"]},
  {"p":["fb_ref"]},
  {"p":["fb_source"]},
  {"p":["fbadid"]},
  {"p":["fbclid"]},
  {"p":["gad_campaignid"]},
  {"p":["gad_source"]},
  {"p":["gbraid"]},
  {"p":["gclid"]},
  {"p":["gclsrc"]},
  {"p":["gps_adid"]},
  {"p":["guce_referrer"]},
  {"p":["guce_referrer_sig"]},
  {"p":["hsCtaTracking"]},
  {"p":["hsa_acc"]},
  {"p":["hsa_ad"]},
  {"p":["hsa_cam"]},
  {"p":["hsa_grp"]},
  {"p":["hsa_kw"]},
  {"p":["hsa_la"]},
  {"p":["hsa_mt"]},
  {"p":["hsa_net"]},
  {"p":["hsa_ol"]},
  {"p":["hsa_src"]},
  {"p":["hsa_tgt"]},
  {"p":["hsa_ver"]},
  {"p":["hss_channel"]},
  {"p":["igsh"]},
  {"p":["ir_adid"]},
  {"p":["ir_campaignid"]},
  {"p":["ir_partnerid"]},
  {"p":["mc_eid"]},
  {"p":["ml_subscriber"]},
  {"p":["ml_subscriber_hash"]},
  {"p":["msclkid"]},
  {"p":["mtm_campaign"]},
  {"p":["mtm_cid"]},
  {"p":["mtm_content"]},
  {"p":["mtm_group"]},
  {"p":["mtm_keyword"]},
  {"p":["mtm_medium"]},
  {"p":["mtm_placement"]},
  {"p":["mtm_source"]},
  {"p":["oft_c"]},
  {"p":["oft_ck"]},
  {"p":["oft_d"]},
  {"p":["oft_id"]},
  {"p":["oft_ids"]},
  {"p":["oft_k"]},
  {"p":["oft_lk"]},
  {"p":["oft_sk"]},
  {"p":["oly_anon_id"]},
  {"p":["pk_campaign"]},
  {"p":["pk_cid"]},
  {"p":["pk_medium"]},
  {"p":["pk_source"]},
  {"p":["rb_clickid"]},
  {"p":["s_cid"]},
  {"p":["sc_customer"]},
  {"p":["sc_eh"]},
  {"p":["sc_uid"]},
  {"p":["sfmc_activityid"]},
  {"p":["sfmc_id"]},
  {"p":["sms_click"]},
  {"p":["sms_source"]},
  {"p":["sms_uph"]},
  {"p":["srsltid"]},
  {"p":["ss_email_id"]},
  {"p":["ttclid"]},
  {"p":["twclid"]},
  {"p":["unicorn_click_id"]},
  {"p":["vero_conv"]},
  {"p":["vero_id"]},
  {"p":["vgo_ee"]},
  {"p":["wbraid"]},
  {"p":["wickedid"]},
  {"p":["yclid"]},
  {"p":["ym_tracking_id"]},
  {"p":["ymclid"]},
  {"p":["ysclid"]}
];

const PARAM_OPS = new Map();
const CLEAR_OPS = [];

for (let index = 0; index < OPS.length; index += 1) {
  const operation = OPS[index];
  if (operation.q) {
    CLEAR_OPS.push(index);
  }
  for (const parameter of operation.p || []) {
    let indexes = PARAM_OPS.get(parameter);
    if (indexes === undefined) {
      indexes = [];
      PARAM_OPS.set(parameter, indexes);
    }
    indexes.push(index);
  }
  if (operation.f) {
    try {
      operation.r = new RegExp(operation.f, operation.s ? "" : "i");
    } catch {
      operation.r = null;
    }
  }
}

function domainMatches(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function scopeMatches(hostname, operation) {
  if (operation.d && !operation.d.some((domain) => domainMatches(hostname, domain))) {
    return false;
  }
  if (operation.x && operation.x.some((domain) => domainMatches(hostname, domain))) {
    return false;
  }
  return true;
}

function filterMatches(url, operation) {
  return operation.f === undefined || operation.r?.test(url) === true;
}

export function cleanUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return undefined;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  for (const index of CLEAR_OPS) {
    const operation = OPS[index];
    if (
      parsed.search &&
      scopeMatches(hostname, operation) &&
      filterMatches(input, operation)
    ) {
      parsed.search = "";
      return parsed.toString();
    }
  }

  const visited = new Set();
  let changed = false;
  for (const parameter of new Set(parsed.searchParams.keys())) {
    for (const index of PARAM_OPS.get(parameter) || []) {
      if (visited.has(index)) {
        continue;
      }
      visited.add(index);
      const operation = OPS[index];
      if (!scopeMatches(hostname, operation) || !filterMatches(input, operation)) {
        continue;
      }
      for (const name of operation.p) {
        if (parsed.searchParams.has(name)) {
          parsed.searchParams.delete(name);
          changed = true;
        }
      }
    }
  }
  return changed ? parsed.toString() : undefined;
}

export default async function (ctx) {
  if (ctx.env?.ENABLE_QUERY_CLEANING === "false") {
    return undefined;
  }
  const cleaned = cleanUrl(ctx.request?.url);
  return cleaned === undefined ? undefined : { url: cleaned };
}
