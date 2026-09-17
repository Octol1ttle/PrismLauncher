module.exports = async ({github, context, core}) => {
    console.log('in script')
    const {PR_NUMBER} = process.env
    console.log(PR_NUMBER)
}