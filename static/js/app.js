const $ = id => document.getElementById(id);
let metal = "All";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

async function get(url) {
  const response = await fetch(url, {cache:"no-store"});
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch (e) {
    if (!response.ok) throw new Error("Server error while loading product data.");
    throw new Error("Invalid server response.");
  }
}

async function cats() {
  const data = await get("/api/categories");
  $("cat").innerHTML =
    '<option value="All">All</option>' +
    data.map(x => `<option value="${esc(x.name)}">${esc(x.name)}</option>`).join("");
}

async function load() {
  const params = new URLSearchParams({
    metal,
    category: $("cat").value,
    availability: $("av").value,
    sort: $("sort").value,
    q: $("q").value
  });

  const data = await get("/api/products?" + params.toString());

  $("products").innerHTML = data.products.map(x => {
    const image = x.image_path || "";
    const imageHtml = image
      ? `<img class="catalog-image" src="${esc(image)}" alt="">`
      : `<div class="placeholder">${x.metal === "Gold" ? "G" : "S"}</div>`;

    return `
      <article class="card" data-product-id="${Number(x.id)}">
        <div class="pic">
          ${imageHtml}
          <span class="badge">${esc(x.purity)}</span>
        </div>
        <div class="body">
          <small>${esc(x.code)} · ${esc(x.category)}</small>
          <h3>${esc(x.title)}</h3>
          <span>${esc(x.weight)} g · ${esc(x.size)}</span>
          <div class="price">${
            x.show_price && x.price
              ? "₹ " + Number(x.price).toLocaleString("en-IN")
              : "Price on Request"
          }</div>
        </div>
      </article>`;
  }).join("") || '<p>No pieces match your selection.</p>';

  document.querySelectorAll(".card[data-product-id]").forEach(card => {
    card.addEventListener("click", () => detail(Number(card.dataset.productId)));
  });
}

/*
 * IMPORTANT:
 * The detail popup is built without putting product URLs, titles, descriptions,
 * or quotes directly into an HTML attribute. This prevents the previous
 * "'\">" / broken-markup issue.
 */
async function detail(id) {
  try {
    const x = await get("/api/products/" + encodeURIComponent(id));
    const detailRoot = $("detail");

    // Clear previous product completely.
    detailRoot.replaceChildren();

    const wrapper = document.createElement("div");
    wrapper.className = "detail";

    const imageBox = document.createElement("div");
    imageBox.className = "product-detail-image";

    const image = x.image_path || "";
    if (image) {
      const img = document.createElement("img");
      img.className = "detail-product-image";
      img.alt = x.title || "VADDI Jewellery";
      img.src = image;

      img.addEventListener("error", () => {
        imageBox.replaceChildren();
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = x.metal === "Gold" ? "G" : "S";
        imageBox.appendChild(placeholder);
      });

      // Clicking the image opens the independent full-screen viewer.
      img.addEventListener("click", () => {
        if (typeof window.openVaddiImageViewer === "function") {
          window.openVaddiImageViewer(image, x.title || "VADDI Jewellery");
        }
      });

      imageBox.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.textContent = x.metal === "Gold" ? "G" : "S";
      imageBox.appendChild(placeholder);
    }

    const info = document.createElement("div");
    info.className = "product-detail-info";

    const code = document.createElement("p");
    code.textContent = x.code || "";

    const title = document.createElement("h2");
    title.textContent = x.title || "";

    const description = document.createElement("p");
    description.textContent = x.description || "";

    const purity = document.createElement("p");
    purity.innerHTML = "<b>Purity:</b> ";
    purity.append(document.createTextNode(x.purity || ""));

    const weight = document.createElement("p");
    weight.innerHTML = "<b>Weight:</b> ";
    weight.append(document.createTextNode(`${x.weight ?? 0} g`));

    const size = document.createElement("p");
    size.innerHTML = "<b>Size:</b> ";
    size.append(document.createTextNode(x.size || ""));

    const status = document.createElement("p");
    status.innerHTML = "<b>Status:</b> ";
    status.append(document.createTextNode(x.availability || ""));

    const price = document.createElement("p");
    const priceStrong = document.createElement("b");
    priceStrong.textContent =
      x.show_price && x.price
        ? "₹ " + Number(x.price).toLocaleString("en-IN")
        : "Price on Request";
    price.appendChild(priceStrong);

    const wa = document.createElement("a");
    wa.className = "btn dark";
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    wa.href =
      "https://wa.me/919650052262?text=" +
      encodeURIComponent(
        `Hello VADDI Jewellery, I am interested in ${x.title} (${x.code}). Please share details.`
      );
    wa.textContent = "WhatsApp Enquiry";

    info.append(code, title, description, purity, weight, size, status, price, wa);
    wrapper.append(imageBox, info);
    detailRoot.appendChild(wrapper);

    $("modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
  } catch (error) {
    alert(error.message || "Unable to load this product.");
  }
}

function closeModal() {
  $("modal").classList.add("hidden");
  document.body.style.overflow = "";
}

$("modal").addEventListener("click", event => {
  if (event.target === $("modal")) closeModal();
});

document.querySelectorAll(".metals button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".metals button")
      .forEach(x => x.classList.remove("active"));
    button.classList.add("active");
    metal = button.dataset.metal;
    load();
  });
});

["q", "cat", "av", "sort"].forEach(id => {
  $(id).addEventListener("input", load);
  $(id).addEventListener("change", load);
});

$("wa").href =
  "https://wa.me/919650052262?text=" +
  encodeURIComponent(
    "Hello VADDI Jewellery, I would like to enquire about your collection."
  );

(async () => {
  try {
    await cats();
    await load();
  } catch (error) {
    $("products").innerHTML =
      `<p>Unable to load the collection. Please refresh the page.</p>`;
    console.error(error);
  }
})();


// Full-screen product image viewer.
(function initImageViewer(){
  const viewer=$("imageViewer"), img=$("viewerImage"), stage=$("viewerStage");
  const caption=$("viewerCaption"), closeBtn=$("viewerClose");
  const zin=$("viewerZoomIn"), zout=$("viewerZoomOut"), reset=$("viewerZoomReset");
  if(!viewer||!img||!stage)return;
  let scale=1,x=0,y=0,drag=false,sx=0,sy=0,ox=0,oy=0;
  function render(){img.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`;}
  function resetView(){scale=1;x=0;y=0;render();}
  function zoom(d){scale=d===0?1:Math.min(5,Math.max(1,scale+d));if(scale===1){x=0;y=0;}render();}
  window.openVaddiImageViewer=function(src,title){
    if(!src)return;
    img.onerror=()=>{caption.textContent="Image could not be loaded";};
    img.onload=()=>resetView();
    img.src=src;
    caption.textContent=title||"VADDI Jewellery";
    viewer.classList.add("open");
    viewer.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  };
  function close(){viewer.classList.remove("open");viewer.setAttribute("aria-hidden","true");document.body.style.overflow="";img.removeAttribute("src");}
  closeBtn.onclick=close;zin.onclick=()=>zoom(.5);zout.onclick=()=>zoom(-.5);reset.onclick=()=>zoom(0);
  viewer.addEventListener("click",e=>{if(e.target===viewer||e.target===stage)close();});
  document.addEventListener("keydown",e=>{if(!viewer.classList.contains("open"))return;if(e.key==="Escape")close();if(e.key==="+")zoom(.5);if(e.key==="-")zoom(-.5);if(e.key==="0")zoom(0);});
  stage.addEventListener("wheel",e=>{e.preventDefault();zoom(e.deltaY<0?.25:-.25)},{passive:false});
  stage.addEventListener("pointerdown",e=>{if(scale<=1)return;drag=true;sx=e.clientX;sy=e.clientY;ox=x;oy=y;stage.setPointerCapture?.(e.pointerId);stage.classList.add("dragging");});
  stage.addEventListener("pointermove",e=>{if(!drag)return;x=ox+e.clientX-sx;y=oy+e.clientY-sy;render();});
  stage.addEventListener("pointerup",()=>{drag=false;stage.classList.remove("dragging");});
})();
