export class Timer {
    _leader!: number;
    _follower!: number;
    _delay!: number;
    _total: number = 0;
    _m_pickInterval!: number
    _m_pickCd!: number
    _m_cmdCd!: number

    get leader(): number {
        return this._leader;
    }

    set leader(newLeader: number) {
        this._leader = newLeader;
    }

    get follower(): number {
        return this._follower;
    }

    set follower(newFollower: number) {
        this._follower = newFollower;
    }

    get delay(): number {
        return this._delay;
    }

    set delay(newDelay: number) {
        this._delay = newDelay;
    }

    get total(): number {
        return this._total;
    }

    set total(add: number) {
        this._total += add;
    }

    get m_pickInterval(): number {
        return this._m_pickInterval;
    }

    set m_pickInterval(newPickInterval: number) {
        this._m_pickInterval = newPickInterval;
    }

    get m_pickCd(): number {
        return this._m_pickCd;
    }

    set m_pickCd(newPickCd: number) {
        this._m_pickCd = newPickCd;
    }

    get m_cmdCd(): number {
        return this._m_cmdCd;
    }

    set m_cmdCd(newCmdCd: number) {
        this._m_cmdCd = newCmdCd;
    }
}