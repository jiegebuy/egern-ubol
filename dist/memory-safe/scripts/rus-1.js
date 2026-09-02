// Generated from official uBO Lite 2026.901.1442.
// Query-only transforms without initiator/domain-type conditions are included.

const OPS = [
  {"d":["116.ru","14.ru","161.ru","164.ru","178.ru","26.ru","29.ru","35.ru","43.ru","45.ru","48.ru","51.ru","53.ru","56.ru","59.ru","60.ru","63.ru","68.ru","71.ru","72.ru","74.ru","76.ru","86.ru","89.ru","93.ru","chita.ru","e1.ru","ircity.ru","mgorsk.ru","msk1.ru","ngs.ru","ngs22.ru","ngs24.ru","ngs42.ru","ngs55.ru","ngs70.ru","nn.ru","proizhevsk.ru","sochi1.ru","sterlitamak1.ru","tolyatty.ru","ufa1.ru","v1.ru","vladivostok1.ru","voronezh1.ru","ya62.ru"],"f":"from=pogoda","p":["from"]},
  {"d":["3dnews.ru","7days.ru","auto.ru","autodaily.ru","autonews.ru","autopilot.ru","habr.com","igromania.ru","klops.ru","kommersant.ru","kp.ru","mail.ru","metro-cc.ru","mk.ru","myweekend.ru","ntv.ru","ozon.ru","peers.tv","rbc.ru","rbcautonews.ru","rbclifemedia.ru","rbcrealty.ru","ridus.ru","sportmail.ru","sportrbc.ru","sports.ru","vedomosti.ru","vkplay.ru"],"f":"\\?from=","p":["from"],"x":["account.mail.ru","auth.mail.ru","light.mail.ru","o2.mail.ru"]},
  {"d":["3dnews.ru"],"p":["from-source"]},
  {"d":["3dnews.ru"],"p":["topblock"]},
  {"d":["ati.su"],"p":["mp_source"]},
  {"d":["autodaily.ru","autonews.ru","rbc.ru","sportrbc.ru"],"f":"\\?ruid=","p":["ruid"]},
  {"d":["avito.ru"],"p":["context"]},
  {"d":["banki.ru"],"p":["source"]},
  {"d":["bbc.com"],"p":["at_campaign"]},
  {"d":["bbc.com"],"p":["at_medium"]},
  {"d":["drive2.com","drive2.ru"],"p":["digest"]},
  {"d":["drive2.com","drive2.ru"],"p":["tz"]},
  {"d":["dtf.ru","mail.ru","sportmail.ru","sports.ru","vc.ru"],"p":["ref"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["annot_type"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["cl4url"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["fan"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["force_common_feed"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["from"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["lang"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["opertop"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["persistent_id"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["rid"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["rubric"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["stid"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["story"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["t"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["tail_polnotekst_quota"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["tst"]},
  {"d":["dzen.ru","sportsdzen.ru"],"p":["tt"]},
  {"d":["dzen.ru","ya","ya.ru"],"p":["via"]},
  {"d":["dzen.ru","ya.ru"],"p":["clid"]},
  {"d":["dzen.ru"],"p":["integration"]},
  {"d":["dzen.ru"],"p":["partner_user_id"]},
  {"d":["dzen.ru"],"p":["place"]},
  {"d":["dzen.ru"],"p":["secdata"]},
  {"d":["e.mail.ru","octavius.mail.ru","vk.mail.ru"],"p":["octavius-snr"]},
  {"d":["facebook.com"],"p":["ref"]},
  {"d":["finance.ua","minfin.com.ua"],"p":["mcr"]},
  {"d":["finance.ua","minfin.com.ua"],"p":["mpl"]},
  {"d":["finance.ua","minfin.com.ua"],"p":["mpr"]},
  {"d":["gazeta.press","gazeta.ru"],"p":["utm_auth"]},
  {"d":["ggsel.net"],"p":["ai"]},
  {"d":["hd.kinopoisk.ru"],"p":["countryId"]},
  {"d":["hot.game","steambuy.com"],"p":["partner"]},
  {"d":["imdb.com"],"p":["pf_rd_"]},
  {"d":["imdb.com"],"p":["pf_rd_i"]},
  {"d":["imdb.com"],"p":["pf_rd_m"]},
  {"d":["imdb.com"],"p":["pf_rd_p"]},
  {"d":["imdb.com"],"p":["pf_rd_r"]},
  {"d":["imdb.com"],"p":["pf_rd_s"]},
  {"d":["imdb.com"],"p":["pf_rd_t"]},
  {"d":["imdb.com"],"p":["ref_"]},
  {"d":["instagram.com"],"f":"utm_","p":["ig_rid"]},
  {"d":["kufar.by"],"p":["rank"]},
  {"d":["kufar.by"],"p":["searchid"]},
  {"d":["mail.ru","sportmail.ru","vkplay.ru"],"p":["utm_partner_id"]},
  {"d":["mail.ru","sportmail.ru"],"p":["app_id_mytracker"]},
  {"d":["mail.ru","sportmail.ru"],"p":["authid"]},
  {"d":["mail.ru","sportmail.ru"],"p":["back"],"x":["my.mail.ru"]},
  {"d":["mail.ru","sportmail.ru"],"p":["cr"]},
  {"d":["mail.ru","sportmail.ru"],"p":["dwhsplit"]},
  {"d":["mail.ru","sportmail.ru"],"p":["exp_article"]},
  {"d":["mail.ru","sportmail.ru"],"p":["exp_id"]},
  {"d":["mail.ru","sportmail.ru"],"p":["fm"]},
  {"d":["mail.ru","sportmail.ru"],"p":["frommail"]},
  {"d":["mail.ru","sportmail.ru"],"p":["fromnews"]},
  {"d":["mail.ru","sportmail.ru"],"p":["fromprefix"]},
  {"d":["mail.ru","sportmail.ru"],"p":["fromwidget"]},
  {"d":["mail.ru","sportmail.ru"],"p":["mailday"]},
  {"d":["mail.ru","sportmail.ru"],"p":["md"]},
  {"d":["mail.ru","sportmail.ru"],"p":["referrer_block"]},
  {"d":["mail.ru","sportmail.ru"],"p":["rf"]},
  {"d":["mail.ru","sportmail.ru"],"p":["smotri_id"]},
  {"d":["mail.ru","sportmail.ru"],"p":["x-login-auth"]},
  {"d":["maximonline.ru"],"p":["previewToken"]},
  {"d":["my.mail.ru"],"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?my\\.mail\\.ru/apps.*(?:[^A-Za-z0-9_.%\\-]|$)ref=","p":["ref"]},
  {"d":["oformi-foto.ru"],"p":["gid"]},
  {"d":["ozon.ru"],"p":["__rr"]},
  {"d":["ozon.ru"],"p":["_bctx"]},
  {"d":["ozon.ru"],"p":["abt_att"]},
  {"d":["ozon.ru"],"p":["advert"]},
  {"d":["ozon.ru"],"p":["asb"]},
  {"d":["ozon.ru"],"p":["asb2"]},
  {"d":["ozon.ru"],"p":["at"]},
  {"d":["ozon.ru"],"p":["avtc"]},
  {"d":["ozon.ru"],"p":["avte"]},
  {"d":["ozon.ru"],"p":["avts"]},
  {"d":["ozon.ru"],"p":["hs"]},
  {"d":["ozon.ru"],"p":["origin_referer"]},
  {"d":["ozon.ru"],"p":["perehod"]},
  {"d":["r.mail.ru"],"p":["fr"]},
  {"d":["r.mail.ru"],"p":["frm"]},
  {"d":["r.mail.ru"],"p":["hasnavig"]},
  {"d":["r.mail.ru"],"p":["sbmt"]},
  {"d":["r.mail.ru"],"p":["src"]},
  {"d":["r.mail.ru"],"p":["test_id"]},
  {"d":["r.mail.ru"],"p":["us"]},
  {"d":["r.mail.ru"],"p":["ushq"]},
  {"d":["r.mail.ru"],"p":["usln"]},
  {"d":["r.mail.ru"],"p":["usqid"]},
  {"d":["r.mail.ru"],"p":["usstr"]},
  {"d":["r.mail.ru"],"p":["ustq"]},
  {"d":["radiosputnik.ru","ria.ru"],"p":["rcmd_alg"]},
  {"d":["radiosputnik.ru","ria.ru"],"p":["rcmd_id"]},
  {"d":["rambler.ru"],"f":"block_click=","p":["block_click"]},
  {"d":["rambler.ru"],"p":["es"]},
  {"d":["rambler.ru"],"p":["readmore"]},
  {"d":["ria.com"],"p":["r_audience"]},
  {"d":["ria.com"],"p":["r_campaign"]},
  {"d":["ria.com"],"p":["r_medium"]},
  {"d":["ria.com"],"p":["r_source"]},
  {"d":["ria.com"],"p":["withoutHeader"]},
  {"d":["ria.ru"],"p":["in"]},
  {"d":["sibnet.ru"],"p":["weid"]},
  {"d":["svoboda.org"],"p":["int_cid"]},
  {"d":["svpressa.ru"],"p":["cba"]},
  {"d":["svpressa.ru"],"p":["cban"]},
  {"d":["svpressa.ru"],"p":["fotd"]},
  {"d":["svpressa.ru"],"p":["fpi"]},
  {"d":["svpressa.ru"],"p":["ft"]},
  {"d":["svpressa.ru"],"p":["hta"]},
  {"d":["svpressa.ru"],"p":["htn"]},
  {"d":["svpressa.ru"],"p":["itg"]},
  {"d":["svpressa.ru"],"p":["lbq"]},
  {"d":["svpressa.ru"],"p":["nbt"]},
  {"d":["svpressa.ru"],"p":["nmp"]},
  {"d":["svpressa.ru"],"p":["notd"]},
  {"d":["svpressa.ru"],"p":["npm"]},
  {"d":["svpressa.ru"],"p":["qcq"]},
  {"d":["svpressa.ru"],"p":["qht"]},
  {"d":["svpressa.ru"],"p":["qt"]},
  {"d":["svpressa.ru"],"p":["top"]},
  {"d":["svpressa.ru"],"p":["tvtd"]},
  {"d":["t-j.ru"],"p":["cdwuid_attempt"]},
  {"d":["tbank.ru"],"p":["internal_source"]},
  {"d":["torbobit.net","tourbobit.com","tourbobit.net","turbobeet.net","turbobi.pw","turbobif.com","turbobit.net","turbobita.net","turbobits.cc","turbobits.net","turboobit.com"],"p":["short_domain"]},
  {"d":["twitch.tv"],"p":["tt_content"]},
  {"d":["twitch.tv"],"p":["tt_medium"]},
  {"d":["twitter.com"],"p":["cxt"]},
  {"d":["vk.com"],"p":["trackcode"]},
  {"d":["vkplay.ru"],"p":["_1ld"]},
  {"d":["vkplay.ru"],"p":["_1lp"]},
  {"d":["vkvideo.ru"],"p":["ref_domain"]},
  {"d":["www.kinopoisk.ru"],"f":"/\\?from_block=","p":["from_block"]},
  {"d":["ya.ru"],"f":"/.*=tabbar","p":["from","source"]},
  {"d":["ya.ru"],"f":"/search/","p":["msid","redircnt","search_domain","search_source","src","suggest_reqid"]},
  {"d":["ya.ru"],"p":["aabrnd"]},
  {"d":["ya.ru"],"p":["npr"]},
  {"d":["ya.ru"],"p":["nr"]},
  {"d":["ya.ru"],"p":["redirect_ts"]},
  {"d":["youtube.com"],"p":["embeds_euri"]},
  {"d":["youtube.com"],"p":["embeds_origin"]},
  {"d":["youtube.com"],"p":["embeds_referring_euri"]},
  {"d":["youtube.com"],"p":["embeds_referring_origin"]},
  {"d":["youtube.com"],"p":["embeds_widget_referrer"]},
  {"d":["youtube.com"],"p":["feature"]},
  {"d":["youtube.com"],"p":["source_ve_path"]},
  {"d":["youtube.com"],"p":["sub_confirmation"]},
  {"f":"/\\?from=sds","p":["from"]},
  {"f":"/\\?from=smm$","p":["from"]},
  {"f":"/\\?from=yanews","p":["from"]},
  {"f":"/\\?ref=tg","p":["ref"]},
  {"f":"\\.html\\?media\\&ila_","p":["media"]},
  {"f":"\\?es=smi2","p":["es"]},
  {"f":"\\?from=smi2agg","p":["from"]},
  {"f":"\\?prov=ukrnet","p":["prov"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?afisha\\.yandex\\..*/.*(?:[^A-Za-z0-9_.%\\-]|$)source=","p":["source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?alice\\.yandex\\..*/\\?utm_to=","p":["utm_to"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)af=","p":["af"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)af_dp=","p":["af_dp"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)aff_fcid=","p":["aff_fcid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)aff_fsk=","p":["aff_fsk"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)aff_platform=","p":["aff_platform"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)aff_trace_key=","p":["aff_trace_key"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)afsmartredirect=","p":["afsmartredirect"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)algo_pvid=","p":["algo_pvid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)gatewayAdapt=","p":["gatewayAdapt"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)mixer_rcmd_bucket_id=","p":["mixer_rcmd_bucket_id"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)pdp_trigger_item_id=","p":["pdp_trigger_item_id"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)ru_algo_pv_id=","p":["ru_algo_pv_id"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)scenario=","p":["scenario"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)sellerId=","p":["sellerId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)shpMethod=","p":["shpMethod"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)sk=","p":["sk"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)spm=","p":["spm"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)spmc=","p":["spmc"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)spmd=","p":["spmd"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)terminal_id=","p":["terminal_id"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)traffic_source=","p":["traffic_source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)tt=","p":["tt"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aliexpress\\..*(?:[^A-Za-z0-9_.%\\-]|$)type_rcmd=","p":["type_rcmd"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?allarknow\\.online/.*block=","p":["block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?aniqit\\.com/.*geoblock=","p":["geoblock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?ashdi\\.vip/.*geoblock=","p":["geoblock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?booking\\.com/.*\\.html\\?.*(?:[^A-Za-z0-9_.%\\-]|$)aid=","p":["aid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?booking\\.com/.*\\.html\\?.*(?:[^A-Za-z0-9_.%\\-]|$)chal_t=","p":["chal_t"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?booking\\.com/.*\\.html\\?.*(?:[^A-Za-z0-9_.%\\-]|$)force_referer=","p":["force_referer"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?booking\\.com/.*\\.html\\?.*(?:[^A-Za-z0-9_.%\\-]|$)label=","p":["label"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?disk\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)source=","p":["source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?kodik\\.cc/.*geoblock=","p":["geoblock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?kodik\\.info/.*geoblock=","p":["geoblock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?kodikdb\\.com/.*geoblock=","p":["geoblock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?kodikplayer\\.com/.*geoblock=","p":["geoblock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)auth_renewed=","p":["auth_renewed"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)cpa=","p":["cpa"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)cpc=","p":["cpc"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)distr_type=","p":["distr_type"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)mclid=","p":["mclid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)nid=","p":["nid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)offerid=","p":["offerid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)pp=","p":["pp"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)purchase\\-referrer=","p":["purchase-referrer"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)sponsored=","p":["sponsored"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?market\\.yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)vid=","p":["vid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?namy\\.ws/embed/.*geo_block=","p":["geo_block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?namy\\.ws/embed/.*geoblock=","p":["geoBlock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?obrut\\.show/.*geo_block=","p":["geo_block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?online\\-serial\\.com/.*block=","p":["block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?ortified\\.ws/embed/.*geo_block=","p":["geo_block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?ortified\\.ws/embed/.*geoblock=","p":["geoBlock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?quke\\.ru/promocodes\\?utm_campaign=.*\\.","p":["utm_campaign"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?ru/.*/comments/\\?recordid=","p":["recordId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?ru/.*/comments/\\?recordid=.*(?:[^A-Za-z0-9_.%\\-]|$)regionId=","p":["regionId"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?ru/.*/comments/\\?recordid=.*(?:[^A-Za-z0-9_.%\\-]|$)source=","p":["source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?rutube\\.ru/video/","p":["r"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?stloadi\\.live/.*block=","p":["block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?stravers\\.live/.*block=","p":["block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?variyt\\.ws/embed/.*geo_block=","p":["geo_block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?variyt\\.ws/embed/.*geoblock=","p":["geoBlock"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?vk\\.com/widget_comments\\.php.*(?:[^A-Za-z0-9_.%\\-]|$)referrer=","p":["referrer"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)aqs=","p":["aqs"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)authuser=","p":["authuser"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)bih=","p":["bih"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)biw=","p":["biw"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)cshid=","p":["cshid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)dpr=","p":["dpr"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)ei=","p":["ei"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)fbs=","p":["fbs"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)gs_lcp=","p":["gs_lcp"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)gs_lcrp=","p":["gs_lcrp"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)gs_lp=","p":["gs_lp"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)gs_ssp=","p":["gs_ssp"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)ie=","p":["ie"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)iflsig=","p":["iflsig"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)newwindow=","p":["newwindow"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)oq=","p":["oq"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)rlz=","p":["rlz"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sa=","p":["sa"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sca_esv=","p":["sca_esv"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sca_upv=","p":["sca_upv"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sclient=","p":["sclient"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sei=","p":["sei"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)source=","p":["source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sourceid=","p":["sourceid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sstk=","p":["sstk"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sxsrf=","p":["sxsrf"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)uact=","p":["uact"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?.*(?:[^A-Za-z0-9_.%\\-]|$)ved=","p":["ved"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/search\\?client=","p":["client"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/webhp\\?.*(?:[^A-Za-z0-9_.%\\-]|$)sa=","p":["sa"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?www\\.google\\..*/webhp\\?.*(?:[^A-Za-z0-9_.%\\-]|$)ved=","p":["ved"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?ya\\.ru/images/.*(?:[^A-Za-z0-9_.%\\-]|$)source=","p":["source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)clid=","p":["clid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)npr=","p":["npr"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)nr=","p":["nr"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)redirect_ts=","p":["redirect_ts"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*(?:[^A-Za-z0-9_.%\\-]|$)via=","p":["via"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*/images/.*(?:[^A-Za-z0-9_.%\\-]|$)source=","p":["source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*/search/.*(?:[^A-Za-z0-9_.%\\-]|$)msid=","p":["msid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*/search/.*(?:[^A-Za-z0-9_.%\\-]|$)redircnt=","p":["redircnt"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*/search/.*(?:[^A-Za-z0-9_.%\\-]|$)search_domain=","p":["search_domain"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*/search/.*(?:[^A-Za-z0-9_.%\\-]|$)search_source=","p":["search_source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*/search/.*(?:[^A-Za-z0-9_.%\\-]|$)src=","p":["src"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*/search/.*(?:[^A-Za-z0-9_.%\\-]|$)suggest_reqid=","p":["suggest_reqid"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*=tabbar.*(?:[^A-Za-z0-9_.%\\-]|$)from=","p":["from"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*=tabbar.*(?:[^A-Za-z0-9_.%\\-]|$)source=","p":["source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?yandex\\..*\\?source=tableau_tv","p":["source"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?youtube\\.com/embed/.*(?:[^A-Za-z0-9_.%\\-]|$)iv_load_policy=","p":["iv_load_policy"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?youtube\\.com/embed/.*(?:[^A-Za-z0-9_.%\\-]|$)rel=","p":["rel"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?zenithjs\\.ws/embed/.*geo_block=","p":["geo_block"]},
  {"f":"^[A-Za-z][A-Za-z0-9+.-]*://(?:[^/?#]*\\.)?zenithjs\\.ws/embed/.*geoblock=","p":["geoBlock"]},
  {"f":"fbclid=","p":["fbclid"]},
  {"f":"is_retargeting=","p":["c","pid","source_caller"]},
  {"f":"referrer=appmetrica_tracking_id","p":["referrer"]},
  {"f":"utm_source=.*partner=","p":["partner"]},
  {"p":["?utm_source"]},
  {"p":["_gl"]},
  {"p":["_openstat"]},
  {"p":["admitad_uid"]},
  {"p":["af_click_lookback"]},
  {"p":["af_force_deeplink"]},
  {"p":["af_xp"]},
  {"p":["afclid"]},
  {"p":["amp;utm_campaign"]},
  {"p":["amp;utm_content"]},
  {"p":["amp;utm_erid"]},
  {"p":["amp;utm_medium"]},
  {"p":["amp;utm_source"]},
  {"p":["amp;utm_term"]},
  {"p":["at_gd"]},
  {"p":["cuid"]},
  {"p":["fref"]},
  {"p":["gclid"]},
  {"p":["gtm"]},
  {"p":["hc_ref"]},
  {"p":["ila_camaign"]},
  {"p":["ila_campaign"]},
  {"p":["ila_context"]},
  {"p":["ila_location"]},
  {"p":["irclickid"]},
  {"p":["irgwc"]},
  {"p":["is_retargeting"]},
  {"p":["maca"]},
  {"p":["mt_adset"]},
  {"p":["mt_campaign"]},
  {"p":["mt_click"]},
  {"p":["mt_click_id"]},
  {"p":["mt_link_id"]},
  {"p":["mt_network"]},
  {"p":["mt_sub"]},
  {"p":["mt_sub1"]},
  {"p":["mt_sub2"]},
  {"p":["mt_sub3"]},
  {"p":["mt_sub4"]},
  {"p":["mt_sub5"]},
  {"p":["pclid"]},
  {"p":["pulse_traffic"]},
  {"p":["ref_src"]},
  {"p":["ref_url"]},
  {"p":["referrer_clid"]},
  {"p":["rtclick"]},
  {"p":["shortlink"]},
  {"p":["srsltid"]},
  {"p":["traffic_source"]},
  {"p":["utm-source"]},
  {"p":["utm_campaing"]},
  {"p":["utm_cmpaign"]},
  {"p":["utm_content"]},
  {"p":["utm_erid"]},
  {"p":["utm_event"]},
  {"p":["utm_id"]},
  {"p":["utm_name"]},
  {"p":["utm_referer"]},
  {"p":["utm_referrer"]},
  {"p":["utm_sourece"]},
  {"p":["utm_space"]},
  {"p":["utm_term"]},
  {"p":["utm_test"]},
  {"p":["utmterm"]},
  {"p":["xtor"]},
  {"p":["yaclid"]},
  {"p":["yclid"]},
  {"p":["yredirect"]},
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
