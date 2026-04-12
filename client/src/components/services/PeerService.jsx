/**
 * PeerService — singleton WebRTC peer connection manager.
 *
 * Key fixes vs original:
 *  1. Multiple STUN servers for better connectivity
 *  2. ICE candidate buffering while remote description isn't set yet
 *  3. `reset()` method so the same instance can be reused across meetings
 *     (avoids "closed" peer after page refresh without full reload)
 *  4. Guards against calling methods on a closed connection
 *  5. `connectionState` and `signalingState` helpers
 */

const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.stunprotocol.org:3478" },
];

class PeerService {
    constructor() {
        this._pendingCandidates = [];
        this._listeners = {}; // eventType -> Set of callbacks
        this._createPeer();
    }

    _createPeer() {
        // Close existing connection cleanly if present
        if (this.peer && this.peer.signalingState !== "closed") {
            try {
                this.peer.close();
            } catch (_) { }
        }

        this.peer = new RTCPeerConnection({
            iceServers: ICE_SERVERS,
            iceCandidatePoolSize: 10,
        });

        this._pendingCandidates = [];

        // Re-attach all registered event listeners to the new connection
        if (this._listeners) {
            for (const [eventType, callbacks] of Object.entries(this._listeners)) {
                for (const cb of callbacks) {
                    this.peer.addEventListener(eventType, cb);
                }
            }
        }
    }

    /** Register an event listener that persists across reconnections */
    addEventListener(eventType, callback) {
        if (!this._listeners[eventType]) this._listeners[eventType] = new Set();
        this._listeners[eventType].add(callback);
        if (this.peer) this.peer.addEventListener(eventType, callback);
    }

    /** Remove a registered event listener */
    removeEventListener(eventType, callback) {
        if (this._listeners[eventType]) {
            this._listeners[eventType].delete(callback);
        }
        if (this.peer) this.peer.removeEventListener(eventType, callback);
    }

    /** Call this before starting a new meeting (e.g. after page refresh or re-joining) */
    reset() {
        this._createPeer();
    }

    get connectionState() {
        return this.peer?.connectionState ?? "closed";
    }

    get signalingState() {
        return this.peer?.signalingState ?? "closed";
    }

    async getOffer() {
        if (!this.peer || this.peer.signalingState === "closed") {
            this._createPeer();
        }
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    }

    async getAnswer(offer) {
        if (!this.peer || this.peer.signalingState === "closed") {
            this._createPeer();
        }
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        // Flush buffered ICE candidates now that remote description is set
        await this._flushPendingCandidates();
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(ans));
        return ans;
    }

    /** Called after receiving an "answer" from the remote */
    async setLocalDescription(ans) {
        if (!this.peer || this.peer.signalingState === "closed") return;
        if (
            this.peer.signalingState === "stable" &&
            this.peer.remoteDescription
        ) {
            // Already set — ignore duplicate
            return;
        }
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        await this._flushPendingCandidates();
    }

    /**
     * Add an ICE candidate. If remote description isn't ready yet, buffer it.
     */
    async addIceCandidate(candidate) {
        if (!candidate) return;
        if (
            this.peer &&
            this.peer.remoteDescription &&
            this.peer.remoteDescription.type
        ) {
            try {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.warn("addIceCandidate error:", e);
            }
        } else {
            this._pendingCandidates.push(candidate);
        }
    }

    async _flushPendingCandidates() {
        const pending = [...this._pendingCandidates];
        this._pendingCandidates = [];
        for (const c of pending) {
            try {
                await this.peer.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {
                console.warn("flush ICE candidate error:", e);
            }
        }
    }

    /** Safely add a track, guarding against closed state */
    addTrack(track, stream) {
        if (!this.peer || this.peer.signalingState === "closed") return null;
        try {
            return this.peer.addTrack(track, stream);
        } catch (e) {
            console.error("addTrack error:", e);
            return null;
        }
    }

    /** Safely remove a sender */
    removeTrack(sender) {
        if (!this.peer || this.peer.signalingState === "closed") return;
        try {
            this.peer.removeTrack(sender);
        } catch (e) {
            console.warn("removeTrack error:", e);
        }
    }

    getSenders() {
        if (!this.peer || this.peer.signalingState === "closed") return [];
        return this.peer.getSenders();
    }
}

export default new PeerService();