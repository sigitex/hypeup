import "@hypeup/lexicon"

export function getStaticPaths() {
  return [
    { slug: "hello-world" },
    { slug: "second-post" },
  ]
}

export default function post(params: { slug: string }) {
  return html(body(h1(`Post: ${params.slug}`)))
}
