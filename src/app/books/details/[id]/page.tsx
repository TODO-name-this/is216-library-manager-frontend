//"use client";
import { mockBooks as Book } from "@/lib/mockBook";
// import { getAuthorsByBookId } from "@/app/actions/authorActions"
// import { getBookById } from "@/app/actions/bookActions"
// import { getCategoriesByBookId } from "@/app/actions/categoryActions"
// import { getReviewsByBookId } from "@/app/actions/reviewActions"

export default async function Details({
  params,
}: {
  params: { id: string }; //Promise<{ id: string }>
}) {
  // const id = (await params).id
  // const book = await getBookById(id)
  // const reviews = await getReviewsByBookId(id)
  // const authors = await getAuthorsByBookId(id)
  // const categories = await getCategoriesByBookId(id)
  const id = params.id;
  const book = Book.find((b) => b.id === id);

  if (!book) {
    throw new Error(`Book with id ${id} not found`);
  }
  
  return (
    <main className="w-full max-w-full rounded bg-gray-900 p-4 shadow text-white">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-8">
        <div className="flex-shrink-0">
          <img
            className="mx-auto h-auto w-78 rounded shadow-lg"
            src={book.imageUrl}
            alt={book.title}
          />
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <h2 className="text-3xl font-bold">{book.title}</h2>
          <p>Publisher: {book.publisher}</p>
          <p>Publication date: {book.publicationDate}</p>
          <p>ISBN: {book.isbn}</p>
          <p>
            Status:{" "}
            <span className="font-medium text-red-400">{book.status}</span>
          </p>
          <p>
            Rating: {book.rating}
            <span className="text-yellow-400">★</span> ({book.ratingCount}{" "}
            ratings)
          </p>

          <p className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span>Author:</span>
            {book.authors.map((author, index) => (
              <a
                key={index}
                className="inline-block rounded border-2 border-blue-500 p-0.5 hover:bg-blue-500"
                href="#"
              >
                {author}
              </a>
            ))}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span>Category:</span>
            {book.categories.map((cat, index) => (
              <a
                key={index}
                className="inline-block rounded border-2 border-blue-500 p-0.5 hover:bg-blue-500"
                href="#"
              >
                {cat}
              </a>
            ))}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-row justify-center space-x-5">
        <a
          className="rounded bg-blue-500 px-10 py-2 duration-200 hover:bg-blue-700"
          href="#"
        >
          Reserve
        </a>
      </div>

      <div>
        <h3 className="mt-5 mb-2 text-xl font-bold">
          Comments ({book.comments.length})
        </h3>

        <div className="mt-2 flex items-center space-x-1">
          <span className="text-white">Rating:</span>
          {[...Array(5)].map((_, i) => (
            <button
              key={i}
              title={`${i + 1} star`}
              className="text-2xl text-gray-400 hover:text-yellow-400"
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          id="comment"
          className="w-full rounded border border-gray-700 bg-gray-900 p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none mt-2"
          rows={4}
          placeholder="Please comment respectfully to avoid having your account blocked."
        ></textarea>

        <div className="text-right">
          <button className="mt-1 rounded bg-blue-500 px-4 py-2 text-white transition duration-200 hover:bg-blue-600">
            Submit
          </button>
        </div>

        <div className="my-5 flex flex-col space-y-3">
          {book.comments.map((cmt, index) => (
            <div
              key={index}
              className="flex flex-row rounded bg-gray-800 p-4 text-white shadow"
            >
              <img
                className="my-auto mr-4 h-12 w-12 rounded-full"
                src="https://cdn-icons-png.flaticon.com/128/149/149071.png"
                alt="user"
              />
              <div className="flex flex-col">
                <a className="font-semibold text-blue-300" href="#">
                  {cmt.user}
                </a>
                <p className="text-sm text-gray-400">
                  {cmt.date} • {cmt.rating}
                  <span className="text-yellow-400">★</span>
                </p>
                <p>{cmt.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-row justify-center space-x-5">
          {["«", "‹", "›", "»"].map((char, i) => (
            <button
              key={i}
              className="h-12 w-12 rounded-full bg-blue-500 text-white transition duration-200 hover:bg-blue-600"
            >
              {char}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-row justify-center space-x-5">
          <button className="rounded bg-blue-500 px-10 py-2 hover:bg-blue-600">
            Load more comments
          </button>
        </div>
      </div>
    </main>
  );
}
