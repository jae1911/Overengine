export interface bgpPeer {
    readonly ix_id: number;
    readonly name: string;
    readonly name_full: string;
    readonly country_code: string;
    readonly city: string;
    readonly ipv4_address: string;
    readonly ipv6_address: string;
    readonly speed: number;
}

export interface bgpMeta {
    readonly time_zone: string;
    readonly api_version: number;
    readonly execution_time: string;
}

export interface bgpIx {
    readonly status: string;
    readonly status_message: string;
    readonly data: readonly bgpPeer[];
    readonly meta: bgpMeta;
}

export interface bgpUpstream {
    readonly asn: number;
    readonly name: string;
    readonly description: string;
    readonly country_code: string;
}

export interface bgpUpstreamData {
    readonly ipv4_upstreams: readonly bgpUpstream[];
    readonly ipv6_upstreams: readonly bgpUpstream[];
}

export interface bgpUpstreams {
    readonly status: string;
    readonly status_message: string;
    readonly data: bgpUpstreamData;
    readonly ipv4_graph: string;
    readonly ipv6_graph: string;
    readonly meta: bgpMeta;
}
