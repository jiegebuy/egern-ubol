// Generated from official uBO Lite 2026.729.1529.
// Query-only transforms without initiator/domain-type conditions are included.

const OPS = [
  {"d":["facebook.com"],"p":["ref"]},
  {"d":["imdb.com"],"p":["pf_rd_"]},
  {"d":["imdb.com"],"p":["pf_rd_i"]},
  {"d":["imdb.com"],"p":["pf_rd_m"]},
  {"d":["imdb.com"],"p":["pf_rd_p"]},
  {"d":["imdb.com"],"p":["pf_rd_r"]},
  {"d":["imdb.com"],"p":["pf_rd_s"]},
  {"d":["imdb.com"],"p":["pf_rd_t"]},
  {"d":["imdb.com"],"p":["ref_"]},
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
