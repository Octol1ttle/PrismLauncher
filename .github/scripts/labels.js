module.exports = async ({github, context, core}) => {
    if (context.eventName === 'push') {
        await checkPullsForConflicts(github, context)
        return;
    }
}

async function checkPullsForConflicts(github, context) {
    for await (const pull of github.paginate.iterator(github.rest.pulls.list, {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        state: 'open'
    })) {
        console.log(pull.mergeable)
    }
}