import dns from 'dns';
import net from 'net';
import { URL } from 'url';

export class UrlSafetyService {
  /**
   * Checks if an IPv4 or IPv6 address belongs to private/internal/cloud metadata subnets.
   * Only operates on valid IP strings (returns false if input is not an IP address).
   */
  public static isPrivateIp(ip: string): boolean {
    const ipType = net.isIP(ip);

    // IPv4 checks
    if (ipType === 4) {
      const parts = ip.split('.').map((p) => parseInt(p, 10));
      if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
        return false;
      }

      const [b0, b1] = parts;

      // 0.0.0.0/8 (Current network)
      if (b0 === 0) return true;
      // 127.0.0.0/8 (Loopback)
      if (b0 === 127) return true;
      // 10.0.0.0/8 (Private-Use)
      if (b0 === 10) return true;
      // 172.16.0.0/12 (Private-Use: 172.16.0.0 – 172.31.255.255)
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
      // 192.168.0.0/16 (Private-Use)
      if (b0 === 192 && b1 === 168) return true;
      // 169.254.0.0/16 (Link-Local, AWS/GCP/Azure Metadata 169.254.169.254)
      if (b0 === 169 && b1 === 254) return true;
      // 224.0.0.0+ (Multicast & Future use)
      if (b0 >= 224) return true;

      return false;
    }

    // IPv6 checks
    if (ipType === 6) {
      const lower = ip.toLowerCase();
      // ::1 (Loopback)
      if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
      // fe80::/10 (Link-Local)
      if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
        return true;
      }
      // fc00::/7 (Unique Local Address)
      if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
      // IPv4-mapped IPv6 (::ffff:127.0.0.1)
      if (lower.startsWith('::ffff:')) {
        const v4Part = lower.replace('::ffff:', '');
        return this.isPrivateIp(v4Part);
      }

      return false;
    }

    return false;
  }

  /**
   * Validates target URL against SSRF attacks:
   * 1. Protocol must be http or https.
   * 2. Hostname cannot be localhost or an explicit IP in private range.
   * 3. DNS resolution must not resolve to any private/internal/cloud metadata address.
   */
  public static async validateUrl(inputUrl: string): Promise<{ valid: boolean; normalizedUrl?: string; error?: string }> {
    let parsed: URL;
    try {
      parsed = new URL(inputUrl);
    } catch {
      return { valid: false, error: 'Malformed URL: Must be a valid HTTP or HTTPS web address.' };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are allowed.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Loopback check
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      return { valid: false, error: 'SSRF Protection: Access to localhost or loopback destinations is forbidden.' };
    }

    // Direct IP check (only if hostname is an IP address literal)
    if (net.isIP(hostname) !== 0 && this.isPrivateIp(hostname)) {
      return { valid: false, error: 'SSRF Protection: Access to private, local, or cloud metadata IP ranges is forbidden.' };
    }

    // DNS lookup check to guard against DNS rebinding & internal hostnames
    try {
      const addresses = await dns.promises.lookup(hostname, { all: true });
      if (!addresses || addresses.length === 0) {
        return { valid: false, error: `DNS resolution failed: Hostname "${hostname}" could not be resolved.` };
      }

      for (const addr of addresses) {
        if (this.isPrivateIp(addr.address)) {
          return {
            valid: false,
            error: `SSRF Protection: Domain "${hostname}" resolves to protected/private address (${addr.address}).`,
          };
        }
      }
    } catch (err: any) {
      return { valid: false, error: `DNS resolution error for "${hostname}": ${err.message || 'Unreachable'}` };
    }

    // Normalize URL
    parsed.hash = ''; // strip client fragments
    return { valid: true, normalizedUrl: parsed.toString() };
  }
}
