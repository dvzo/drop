export class Timer {
    _leader!: number;
    _follower!: number;
    _delay!: number;
    _total: number = 0;

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
}