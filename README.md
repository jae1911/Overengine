# Overengine

My overengineered blog/website engine.

## Roadmap

 - [x] Basic page render to markdown
 - [x] vhost-based whitelist system (allows multiple domains to be used for app, unlike `gohugo`)
 - [x] Templating
 - [x] Menus configurable via YAML markdown header
 - [x] Blog permalinks (format URI like `/blog/{year}/{month}/{day}/{title}` from YAML header)
 - [ ] Compression (GZIP; BROTLI)
 - [x] Shortcodes
 - [x] Markdown file location to web path (`content/blog/2022/test.md` goes to `/blog/2022/test`)
 - [x] RSS feed
 - [x] JSON feed
 - [ ] Dynamic IP loading (can detect kind of IP used and display message to IPv4 users)
 - [ ] Docker / Baremetal deployment
 - [x] Dynamic content loading (content loaded from distant repo; reloads all clients and displays when pulled)

## License

The software is provided under the MIT License.
