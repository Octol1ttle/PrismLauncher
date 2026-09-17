module.exports = async ({github, context, core}) => {
    const {PR_NUMBER} = process.env
    console.log(PR_NUMBER)
}