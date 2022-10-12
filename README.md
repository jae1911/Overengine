# Overengine

My overengineered blog/website engine.

## Roadmap

 - [ ] Basic page render to markdown
 - [ ] vhost-based whitelist system (allows multiple domains to be used for app, unlike `gohugo`)
 - [ ] Templating
 - [ ] Menus configurable via YAML markdown header
 - [ ] Blog permalinks (format URI like `/blog/{year}/{month}/{day}/{title}` from YAML header)
 - [ ] Compression (GZIP; BROTLI)
 - [ ] Shortcodes
 - [ ] Markdown file location to web path (`content/blog/2022/test.md` goes to `/blog/2022/test`)
 - [ ] RSS feed
 - [ ] JSON feed
 - [ ] Dynamic IP loading (can detect kind of IP used and display message to IPv4 users)
 - [ ] Docker / Baremetal deployment
 - [ ] Dynamic content loading (content loaded from distant repo; reloads all clients and displays when pulled)

## License

The software is provided under the MIT License.
