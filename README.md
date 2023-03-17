# Overengine

My overengineered blog/website engine.

[![builds.sr.ht status](https://builds.sr.ht/~jae/Overengine.svg)](https://builds.sr.ht/~jae/Overengine?)

## Current Ideas

 - [ ] Cli version (runs tests & lightweight server from `sitecontent`)

## Current Roadmap

 - [x] Tagging
 - [x] Display dates on blog posts
 - [x] Add warning if blog post is older than a year
 - [x] WakaTime/Open-Source alternative integration
 - [ ] Twitch.tv/Trovo integration
 - [x] BGP Monitoring (show upstreams on a page & API; see https://bgpview.docs.apiary.io/#reference/0/asn-upstreams/view-asn-upstreams)
 - [x] OpenWeatherMap weather widget
 - [ ] WebFinger
 - [ ] WebMention

## v0 Roadmap

 - [x] Basic page render to markdown
 - [x] vhost-based whitelist system (allows multiple domains to be used for app, unlike `gohugo`)
 - [x] Templating
 - [x] Menus configurable via YAML markdown header
 - [x] Blog permalinks (format URI like `/blog/{year}/{month}/{day}/{title}` from YAML header)
 - ~~[ ] Compression (GZIP; BROTLI)~~ *better to handle at the RP level*
 - [x] Shortcodes
 - [x] Markdown file location to web path (`content/blog/2022/test.md` goes to `/blog/2022/test`)
 - [x] RSS feed
 - [x] JSON feed
 - [x] Dynamic IP loading (can detect kind of IP used and display message to IPv4 users)
 - [X] Docker / Baremetal deployment
 - [x] Dynamic content loading (content loaded from distant repo; reloads all clients and displays when pulled)

## License

The software is provided under the GNU GPLv3 License.
