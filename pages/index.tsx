import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>JDIP</title>

        <meta property="og:title" content="JDIP" />
        <meta
          property="og:description"
          content="In this link i showcasing my fav work and helping community by learning"
        />
        <meta
          property="og:image"
          content="/images/featured_img.webp"
        />
        <meta property="og:url" content="https://jdip.vercel.app" />
        <meta property="og:type" content="website" />
      </Head>

      {/* TEMP: render raw HTML */}
      <div dangerouslySetInnerHTML={{ __html: `<!-- content comes here -->` }} />
      <a href="index.html">My Portfolio site</a>
    </>
  )
}