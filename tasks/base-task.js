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

    task() {}

    toArray() {
        return [
            this.name,
            this.description,
            this.dependencies,
            this.task.bind(this),
            {
                options: this.args
            }
        ];
    }
}

module.exports = Task;
