export default function EditProductPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
            Product Manager
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            Edit Product
          </h1>

          <p className="mt-2 text-slate-600">
            Update product information, pricing, images, and publishing
            settings.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Preview
          </button>

          <button
            type="button"
            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            Save Changes
          </button>
        </div>
      </div>

      <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Product Details
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="productName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Product Name
                </label>

                <input
                  id="productName"
                  name="productName"
                  type="text"
                  placeholder="Example: USANA BiOmega"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Product Slug
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  placeholder="usana-biomega"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="shortDescription"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Short Description
                </label>

                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  rows={3}
                  placeholder="Write a short summary for product cards and search results."
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={10}
                  placeholder="Describe the product, its features, benefits, and suggested use."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Pricing and Inventory
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Price
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="comparePrice"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Compare-at Price
                </label>

                <input
                  id="comparePrice"
                  name="comparePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  SKU
                </label>

                <input
                  id="sku"
                  name="sku"
                  type="text"
                  placeholder="WL-PROD-001"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="inventory"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Inventory Quantity
                </label>

                <input
                  id="inventory"
                  name="inventory"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Product Image
            </h2>

            <div className="mt-5 flex min-h-56 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                  📷
                </div>

                <p className="font-semibold text-slate-800">
                  Upload product image
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  PNG, JPG, or WebP
                </p>

                <input
                  id="productImage"
                  name="productImage"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-green-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-green-800"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Organization
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  <option value="nutrition">Nutrition</option>
                  <option value="supplements">Supplements</option>
                  <option value="skincare">Skincare</option>
                  <option value="fitness">Fitness</option>
                  <option value="wellness">Wellness</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Brand
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="text"
                  placeholder="Example: USANA"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Tags
                </label>

                <input
                  id="tags"
                  name="tags"
                  type="text"
                  placeholder="omega-3, heart health, wellness"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Separate tags with commas.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Publishing
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue="draft"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4">
                <input
                  name="featured"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
                />

                <span>
                  <span className="block font-semibold text-slate-800">
                    Featured Product
                  </span>

                  <span className="mt-1 block text-sm text-slate-500">
                    Display this product in featured sections.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <button
            type="button"
            className="w-full rounded-lg border border-red-200 bg-white px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50"
          >
            Delete Product
          </button>
        </aside>
      </form>
    </main>
  );
}