class Task {
    constructor(name = '', description = '') {
        this.name = name;
        this.description = description;
    }

    get dependencies() {
        return [];
    }

    get args() {
        return {};
    }

    toArray() {
        const out = [
            this.name,
            this.description,
            this.dependencies
        ];

        if (this.task) {
            out.push(this.task.bind(this));
        }

        out.push({
            options: this.args
        })

        return out;
    }
}

module.exports = Task;
