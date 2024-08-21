export default function Page(){
  const config = JSON.parse(process.env.CONFIG)

  return(
    <>
    <p>Test</p>
    <p>{config.name}</p>
    </>
    )
}