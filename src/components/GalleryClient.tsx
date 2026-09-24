"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type P = {
  id: string;
  publicPhotoCode: string;
  fileName: string;
};

type E = {
  id: string;
  eventName: string;
  eventCode: string;
  brideName: string;
  groomName: string;
  clientName: string;
  eventDate: string;
  eventType: string;
  location: string;
  description: string;
  allowPhotoSharing: boolean;
  allowGallerySharing: boolean;
  allowOptimizedDownload: boolean;
  passwordProtected: boolean;
};

export function GalleryClient({
  event,
  photos,
}: {
  event: E;
  photos: P[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [clientKey, setClientKey] = useState("");
  const [message, setMessage] = useState("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);

  const [showGalleryInfo, setShowGalleryInfo] =
    useState(false);

  const [slideshowActive, setSlideshowActive] =
    useState(false);

  const [showAlbumSelection, setShowAlbumSelection] =
    useState(false);

  const [albumClientName, setAlbumClientName] =
    useState(event.clientName || "");

  const [albumPhone, setAlbumPhone] =
    useState("");

  const [albumSubmitting, setAlbumSubmitting] =
    useState(false);

  const [showQr, setShowQr] =
    useState(false);

  const [qrUrl, setQrUrl] =
    useState("");

  const [qrTitle, setQrTitle] =
    useState("");

  const touchStartX = useRef<number | null>(null);

  const count = selected.length;

  const selectedSet = useMemo(
    () => new Set(selected),
    [selected]
  );

  const favoriteSet = useMemo(
    () => new Set(favorites),
    [favorites]
  );

  const visiblePhotos = useMemo(() => {
    if (!showFavoritesOnly) {
      return photos;
    }

    return photos.filter((photo) =>
      favoriteSet.has(photo.id)
    );
  }, [
    photos,
    favoriteSet,
    showFavoritesOnly,
  ]);

  useEffect(() => {
    if (
      !slideshowActive ||
      viewerIndex === null ||
      visiblePhotos.length === 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setViewerIndex((current) => {
        if (current === null) {
          return current;
        }

        const currentPhoto =
          photos[current];

        const visibleIndex =
          visiblePhotos.findIndex(
            (photo) =>
              photo.id ===
              currentPhoto?.id
          );

        const nextVisibleIndex =
          visibleIndex < 0 ||
          visibleIndex ===
            visiblePhotos.length - 1
            ? 0
            : visibleIndex + 1;

        const nextPhoto =
          visiblePhotos[
            nextVisibleIndex
          ];

        if (!nextPhoto) {
          return current;
        }

        const nextIndex =
          photos.findIndex(
            (photo) =>
              photo.id === nextPhoto.id
          );

        return nextIndex >= 0
          ? nextIndex
          : current;
      });
    }, 3500);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    slideshowActive,
    viewerIndex,
    photos,
    visiblePhotos,
  ]);

  const viewerPhoto =
    viewerIndex !== null
      ? photos[viewerIndex]
      : null;

  useEffect(() => {
    let key =
      localStorage.getItem(
        "ssm_gallery_client_key"
      );

    if (!key) {
      key =
        globalThis.crypto?.randomUUID?.() ||
        `ssm-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      localStorage.setItem(
        "ssm_gallery_client_key",
        key
      );
    }

    setClientKey(key);

    let cancelled = false;

    async function loadFavorites() {
      try {
        const params = new URLSearchParams({
          eventId: event.id,
          clientKey: key!,
        });

        const response = await fetch(
          `/api/favorites?${params.toString()}`,
          { cache: "no-store" }
        );

        const text = await response.text();
        let data: any = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(
            `Favorites API returned invalid response (${response.status})`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Could not load favorites."
          );
        }

        if (
          !cancelled &&
          Array.isArray(data.favorites)
        ) {
          setFavorites(
            data.favorites.filter(
              (value: unknown) =>
                typeof value === "string"
            )
          );
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not load favorites."
          );
        }
      }
    }

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [event.id]);

  useEffect(() => {
    if (viewerIndex === null) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setSlideshowActive(false);
        setViewerIndex(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previousPhoto();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextPhoto();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    viewerIndex,
    photos,
    visiblePhotos,
  ]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter(
            (value) => value !== id
          )
        : [...current, id]
    );
  }

  function selectAll() {
    setSelected(
      visiblePhotos.map(
        (photo) => photo.id
      )
    );
  }

  function openViewer(index: number) {
    setViewerIndex(index);
  }

  function closeViewer() {
    setSlideshowActive(false);
    setViewerIndex(null);
  }

  function startSlideshow() {
    if (visiblePhotos.length === 0) {
      setMessage(
        "No photos available for slideshow."
      );
      return;
    }

    const firstIndex =
      photos.findIndex(
        (photo) =>
          photo.id ===
          visiblePhotos[0].id
      );

    if (firstIndex < 0) {
      return;
    }

    setViewerIndex(firstIndex);
    setSlideshowActive(true);
  }

  function stopSlideshow() {
    setSlideshowActive(false);
  }

  function previousPhoto() {
    setViewerIndex((current) => {
      if (
        current === null ||
        visiblePhotos.length === 0
      ) {
        return current;
      }

      const currentPhoto =
        photos[current];

      const visibleIndex =
        visiblePhotos.findIndex(
          (photo) =>
            photo.id ===
            currentPhoto?.id
        );

      const previousVisibleIndex =
        visibleIndex <= 0
          ? visiblePhotos.length - 1
          : visibleIndex - 1;

      const previousVisiblePhoto =
        visiblePhotos[
          previousVisibleIndex
        ];

      if (!previousVisiblePhoto) {
        return current;
      }

      const previousIndex =
        photos.findIndex(
          (photo) =>
            photo.id ===
            previousVisiblePhoto.id
        );

      return previousIndex >= 0
        ? previousIndex
        : current;
    });
  }

  function nextPhoto() {
    setViewerIndex((current) => {
      if (
        current === null ||
        visiblePhotos.length === 0
      ) {
        return current;
      }

      const currentPhoto =
        photos[current];

      const visibleIndex =
        visiblePhotos.findIndex(
          (photo) =>
            photo.id ===
            currentPhoto?.id
        );

      const nextVisibleIndex =
        visibleIndex < 0 ||
        visibleIndex ===
          visiblePhotos.length - 1
          ? 0
          : visibleIndex + 1;

      const nextVisiblePhoto =
        visiblePhotos[
          nextVisibleIndex
        ];

      if (!nextVisiblePhoto) {
        return current;
      }

      const nextIndex =
        photos.findIndex(
          (photo) =>
            photo.id ===
            nextVisiblePhoto.id
        );

      return nextIndex >= 0
        ? nextIndex
        : current;
    });
  }

  async function toggleFavorite(
    photoId: string
  ) {
    if (!clientKey) {
      setMessage(
        "Favorites are still loading. Please try again."
      );
      return;
    }

    const wasFavorite =
      favoriteSet.has(photoId);

    const nextFavorite =
      !wasFavorite;

    setFavorites((current) => {
      if (nextFavorite) {
        return current.includes(photoId)
          ? current
          : [...current, photoId];
      }

      return current.filter(
        (id) => id !== photoId
      );
    });

    try {
      const response = await fetch(
        "/api/favorites",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            eventId: event.id,
            photoId,
            clientKey,
            favorite:
              nextFavorite,
          }),
        }
      );

      const text = await response.text();
      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Favorites API returned invalid response (${response.status})`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Favorite update failed."
        );
      }

      setMessage(
        nextFavorite
          ? "Added to favorites."
          : "Removed from favorites."
      );
    } catch (error) {
      setFavorites((current) => {
        if (wasFavorite) {
          return current.includes(photoId)
            ? current
            : [...current, photoId];
        }

        return current.filter(
          (id) => id !== photoId
        );
      });

      setMessage(
        error instanceof Error
          ? error.message
          : "Favorite failed."
      );
    }
  }

  async function submitAlbumSelection() {
    const clientName =
      albumClientName.trim();

    const phone =
      albumPhone.trim();

    if (clientName.length < 2) {
      setMessage(
        "Please enter the client name."
      );
      return;
    }

    if (phone.length < 8) {
      setMessage(
        "Please enter a valid phone number."
      );
      return;
    }

    if (selected.length === 0) {
      setMessage(
        "Select at least one photo for the album."
      );
      return;
    }

    if (selected.length > 500) {
      setMessage(
        "You can submit a maximum of 500 photos."
      );
      return;
    }

    setAlbumSubmitting(true);
    setMessage(
      "Submitting album selection..."
    );

    try {
      const response = await fetch(
        "/api/album-selections",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            eventId: event.id,
            clientName,
            phone,
            photoIds: selected,
          }),
        }
      );

      const text =
        await response.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          `Album API returned invalid response (${response.status})`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to submit album selection."
        );
      }

      setMessage(
        `Album selection submitted successfully (${selected.length} photo${
          selected.length !== 1
            ? "s"
            : ""
        }).`
      );

      setShowAlbumSelection(
        false
      );

      setSelected([]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit album selection."
      );
    } finally {
      setAlbumSubmitting(false);
    }
  }

  function getPublicOrigin() {
    const configured =
      process.env.NEXT_PUBLIC_APP_URL?.trim();

    return configured
      ? configured.replace(/\/$/, "")
      : location.origin;
  }

  function getGalleryPublicUrl() {
    return (
      getPublicOrigin() +
      location.pathname +
      location.search
    );
  }

  async function createShareUrl(
    photoIds: string[]
  ) {
    const response = await fetch(
      "/api/share-collections",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          photoIds,
        }),
      }
    );

    const text =
      await response.text();

    let data: any = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      throw new Error(
        `Share API returned invalid response (${response.status})`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Could not create share link."
      );
    }

    if (!data.code) {
      throw new Error(
        "Share API did not return a share code."
      );
    }

    return (
      getPublicOrigin() +
      "/share/" +
      data.code
    );
  }

  async function copyGalleryLink() {
    try {
      await navigator.clipboard.writeText(
        getGalleryPublicUrl()
      );

      setMessage(
        "Gallery link copied."
      );
    } catch {
      setMessage(
        "Could not copy gallery link."
      );
    }
  }

  function openGalleryQr() {
    setQrTitle(event.eventName);
    setQrUrl(
      getGalleryPublicUrl()
    );
    setShowQr(true);
  }

  async function openPhotoQr(
    photo: P
  ) {
    if (!event.allowPhotoSharing) {
      setMessage(
        "Photo sharing is disabled for this gallery."
      );
      return;
    }

    setSlideshowActive(false);
    setMessage(
      "Creating photo QR link..."
    );

    try {
      const url =
        await createShareUrl([
          photo.id,
        ]);

      setQrTitle(
        photo.fileName ||
          event.eventName
      );

      setQrUrl(url);
      setShowQr(true);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not create photo QR."
      );
    }
  }

  async function copyQrLink() {
    if (!qrUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        qrUrl
      );

      setMessage(
        "Link copied."
      );
    } catch {
      setMessage(
        "Could not copy link."
      );
    }
  }

  async function shareGallery() {
    try {
      const url =
        getGalleryPublicUrl();

      if (navigator.share) {
        await navigator.share({
          title: event.eventName,
          url,
        });

        setMessage(
          "Gallery shared."
        );
      } else {
        await navigator.clipboard.writeText(
          url
        );

        setMessage(
          "Gallery link copied."
        );
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      setMessage(
        "Gallery sharing failed."
      );
    }
  }

  async function sharePhoto(
    photo: P
  ) {
    if (!event.allowPhotoSharing) {
      setMessage(
        "Photo sharing is disabled for this gallery."
      );
      return;
    }

    setSlideshowActive(false);
    setMessage(
      "Creating photo share link..."
    );

    try {
      const url =
        await createShareUrl([
          photo.id,
        ]);

      if (navigator.share) {
        await navigator.share({
          title:
            photo.fileName ||
            event.eventName,
          text: event.eventName,
          url,
        });

        setMessage(
          "Photo shared."
        );
      } else {
        await navigator.clipboard.writeText(
          url
        );

        setMessage(
          "Photo link copied."
        );
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        setMessage("");
        return;
      }

      setMessage(
        error instanceof Error
          ? error.message
          : "Photo sharing failed."
      );
    }
  }

  async function downloadPhoto(
    photo: P
  ) {
    if (
      !event.allowOptimizedDownload
    ) {
      setMessage(
        "Photo download is disabled for this gallery."
      );
      return;
    }

    setSlideshowActive(false);
    setMessage(
      "Preparing download..."
    );

    try {
      const response = await fetch(
        `/api/gallery/photos/${photo.id}?download=1`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const text =
          await response.text();

        let data: any = {};

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          // Keep the fallback error below.
        }

        throw new Error(
          data.error ||
            `Download failed (${response.status}).`
        );
      }

      const blob =
        await response.blob();

      const objectUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = objectUrl;
      link.download =
        photo.fileName ||
        "photo";

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(
          objectUrl
        );
      }, 1000);

      setMessage(
        "Download started."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Download failed."
      );
    }
  }

  async function shareSelected() {
    if (!selected.length) {
      return;
    }

    setMessage(
      "Creating share link..."
    );

    try {
      const url =
        await createShareUrl(
          selected
        );

      if (navigator.share) {
        await navigator.share({
          title: event.eventName,
          url,
        });

        setMessage(
          "Selected photos shared."
        );
      } else {
        await navigator.clipboard.writeText(
          url
        );

        setMessage(
          "Selected photo link copied."
        );
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        setMessage("");
        return;
      }

      setMessage(
        error instanceof Error
          ? error.message
          : "Share failed."
      );
    }
  }

  return (
    <main className="section">
      <div className="container">
        <header
          className="glass gold card"
          style={{
            padding: 26,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: "1 1 420px",
              }}
            >
              <p
                className="gold-text"
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  letterSpacing:
                    "0.12em",
                  textTransform:
                    "uppercase",
                }}
              >
                {event.eventType ||
                  "Client Gallery"}

                {event.eventCode
                  ? ` • ${event.eventCode}`
                  : ""}
              </p>

              <h1
                style={{
                  margin: 0,
                  marginBottom: 10,
                }}
              >
                {event.eventName}
              </h1>

              {event.description && (
                <p
                  className="muted"
                  style={{
                    maxWidth: 720,
                    marginBottom: 0,
                  }}
                >
                  {event.description}
                </p>
              )}
            </div>

            <div
              className="glass"
              style={{
                padding:
                  "10px 16px",
                borderRadius: 999,
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <strong>
                {photos.length}
              </strong>

              <span className="muted">
                Photo
                {photos.length !== 1
                  ? "s"
                  : ""}
              </span>

              <span className="muted">
                •
              </span>

              <strong>
                {favorites.length}
              </strong>

              <span className="muted">
                Favorite
                {favorites.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 12,
              marginTop: 22,
            }}
          >
            {event.brideName && (
              <div
                className="glass"
                style={{
                  padding: 14,
                }}
              >
                <small className="muted">
                  Bride
                </small>
                <div>
                  {event.brideName}
                </div>
              </div>
            )}

            {event.groomName && (
              <div
                className="glass"
                style={{
                  padding: 14,
                }}
              >
                <small className="muted">
                  Groom
                </small>
                <div>
                  {event.groomName}
                </div>
              </div>
            )}

            {event.clientName && (
              <div
                className="glass"
                style={{
                  padding: 14,
                }}
              >
                <small className="muted">
                  Client
                </small>
                <div>
                  {event.clientName}
                </div>
              </div>
            )}

            {event.eventDate && (
              <div
                className="glass"
                style={{
                  padding: 14,
                }}
              >
                <small className="muted">
                  Event Date
                </small>

                <div>
                  {new Date(
                    event.eventDate
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </div>
              </div>
            )}

            {event.location && (
              <div
                className="glass"
                style={{
                  padding: 14,
                }}
              >
                <small className="muted">
                  Location
                </small>
                <div>
                  {event.location}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* GALLERY FILTER */}

        {photos.length > 0 && (
          <div
            className="glass gold card"
            style={{
              padding: 12,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong>
                Gallery Filter
              </strong>

              <div className="muted">
                Showing{" "}
                {visiblePhotos.length}{" "}
                photo
                {visiblePhotos.length !== 1
                  ? "s"
                  : ""}
              </div>
            </div>

            <button
              type="button"
              className={
                showFavoritesOnly
                  ? "btn btn-primary"
                  : "btn btn-ghost"
              }
              onClick={() =>
                setShowFavoritesOnly(
                  (current) => !current
                )
              }
            >
              {showFavoritesOnly
                ? "♥ Favorites Only"
                : "♡ Show Favorites"}
            </button>
          </div>
        )}

        {photos.length === 0 ? (
          <div
            className="glass gold card"
            style={{
              padding: 24,
            }}
          >
            <p className="muted">
              No photos are available
              in this gallery yet.
            </p>
          </div>
        ) : showFavoritesOnly &&
          visiblePhotos.length === 0 ? (
          <div
            className="glass gold card"
            style={{
              padding: 24,
              marginBottom: 18,
            }}
          >
            <p className="muted">
              No favorite photos yet.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
              paddingBottom: 110,
            }}
          >
            {visiblePhotos.map(
              (photo, index) => {
                const active =
                  selectedSet.has(
                    photo.id
                  );

                const favorite =
                  favoriteSet.has(
                    photo.id
                  );

                return (
                  <article
                    key={photo.id}
                    className="glass"
                    style={{
                      position:
                        "relative",
                      border: active
                        ? "2px solid #d4af37"
                        : "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 18,
                      overflow:
                        "hidden",
                      background:
                        "#0a0a0a",
                      aspectRatio:
                        "4 / 5",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openViewer(
                          photos.findIndex(
                            (item) =>
                              item.id ===
                              photo.id
                          )
                        )
                      }
                      aria-label={`Open ${photo.fileName}`}
                      style={{
                        width:
                          "100%",
                        height:
                          "100%",
                        padding: 0,
                        border: 0,
                        background:
                          "transparent",
                        cursor:
                          "zoom-in",
                      }}
                    >
                      <img
                        src={`/api/gallery/photos/${photo.id}`}
                        alt={
                          photo.fileName ||
                          `Photo ${
                            index + 1
                          }`
                        }
                        loading="lazy"
                        style={{
                          width:
                            "100%",
                          height:
                            "100%",
                          objectFit:
                            "cover",
                          display:
                            "block",
                        }}
                      />
                    </button>

                    <div
                      style={{
                        position:
                          "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,.70), transparent 45%)",
                        pointerEvents:
                          "none",
                      }}
                    />

                    <div
                      style={{
                        position:
                          "absolute",
                        left: 12,
                        right: 12,
                        bottom: 10,
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: 8,
                        pointerEvents:
                          "none",
                      }}
                    >
                      <small
                        style={{
                          color:
                            "#fff",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {photo.fileName}
                      </small>

                      <small
                        style={{
                          color:
                            "#d4af37",
                        }}
                      >
                        #
                        {photos.findIndex(
                          (item) =>
                            item.id ===
                            photo.id
                        ) + 1}
                      </small>
                    </div>

                    <button
                      type="button"
                      aria-label={
                        favorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      onClick={() =>
                        void toggleFavorite(
                          photo.id
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        top: 10,
                        left: 10,
                        width: 36,
                        height: 36,
                        borderRadius:
                          "50%",
                        border:
                          "1px solid rgba(255,255,255,.55)",
                        background:
                          favorite
                            ? "#d4af37"
                            : "rgba(0,0,0,.58)",
                        color:
                          favorite
                            ? "#000"
                            : "#fff",
                        display:
                          "grid",
                        placeItems:
                          "center",
                        cursor:
                          "pointer",
                        zIndex: 5,
                        backdropFilter:
                          "blur(12px)",
                        fontSize: 18,
                      }}
                    >
                      {favorite
                        ? "♥"
                        : "♡"}
                    </button>

                    <button
                      type="button"
                      aria-label={
                        active
                          ? "Remove photo from selection"
                          : "Select photo"
                      }
                      onClick={() =>
                        toggle(
                          photo.id
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        top: 10,
                        right: 10,
                        width: 36,
                        height: 36,
                        borderRadius:
                          "50%",
                        border: active
                          ? "1px solid #d4af37"
                          : "1px solid rgba(255,255,255,.55)",
                        background:
                          active
                            ? "#d4af37"
                            : "rgba(0,0,0,.58)",
                        color:
                          active
                            ? "#000"
                            : "#fff",
                        display:
                          "grid",
                        placeItems:
                          "center",
                        cursor:
                          "pointer",
                        fontWeight:
                          800,
                        zIndex: 5,
                        backdropFilter:
                          "blur(12px)",
                      }}
                    >
                      {active
                        ? "✓"
                        : "+"}
                    </button>
                  </article>
                );
              }
            )}
          </div>
        )}

        {viewerPhoto &&
          viewerIndex !== null && (
            <div
              role="dialog"
              aria-modal="true"
              onTouchStart={(
                event
              ) => {
                touchStartX.current =
                  event.touches[0]
                    ?.clientX ??
                  null;
              }}
              onTouchEnd={(
                event
              ) => {
                if (
                  touchStartX.current ===
                  null
                ) {
                  return;
                }

                const endX =
                  event
                    .changedTouches[0]
                    ?.clientX;

                if (
                  endX ===
                  undefined
                ) {
                  touchStartX.current =
                    null;
                  return;
                }

                const difference =
                  endX -
                  touchStartX.current;

                if (
                  Math.abs(
                    difference
                  ) > 50
                ) {
                  if (
                    difference > 0
                  ) {
                    previousPhoto();
                  } else {
                    nextPhoto();
                  }
                }

                touchStartX.current =
                  null;
              }}
              style={{
                position:
                  "fixed",
                inset: 0,
                zIndex: 5000,
                background:
                  "rgba(0,0,0,.94)",
                backdropFilter:
                  "blur(18px)",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                padding: 20,
                touchAction:
                  "pan-y",
              }}
            >
              <button
                type="button"
                onClick={
                  closeViewer
                }
                className="btn btn-ghost"
                aria-label="Close viewer"
                style={{
                  position:
                    "absolute",
                  top: 18,
                  right: 18,
                  zIndex: 10,
                }}
              >
                ✕ Close
              </button>

              {photos.length >
                1 && (
                <button
                  type="button"
                  onClick={
                    previousPhoto
                  }
                  className="btn btn-ghost"
                  aria-label="Previous photo"
                  style={{
                    position:
                      "absolute",
                    left: 18,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    zIndex: 10,
                    fontSize: 26,
                  }}
                >
                  ‹
                </button>
              )}

              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: 12,
                }}
              >
                <img
                  src={`/api/gallery/photos/${viewerPhoto.id}`}
                  alt={
                    viewerPhoto.fileName
                  }
                  draggable={false}
                  style={{
                    maxWidth:
                      "100%",
                    maxHeight:
                      "calc(100vh - 220px)",
                    objectFit:
                      "contain",
                    borderRadius:
                      12,
                    userSelect:
                      "none",
                  }}
                />

                <div
                  style={{
                    display:
                      "flex",
                    gap: 8,
                    flexWrap:
                      "wrap",
                    justifyContent:
                      "center",
                    alignItems:
                      "center",
                  }}
                >
                  <div
                    className="glass"
                    style={{
                      padding:
                        "8px 14px",
                      borderRadius:
                        999,
                      maxWidth:
                        "calc(100vw - 40px)",
                      display:
                        "flex",
                      gap: 10,
                      alignItems:
                        "center",
                    }}
                  >
                    <span
                      style={{
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {
                        viewerPhoto.fileName
                      }
                    </span>

                    <span className="muted">
                      {viewerIndex +
                        1}{" "}
                      /{" "}
                      {photos.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() =>
                      void toggleFavorite(
                        viewerPhoto.id
                      )
                    }
                  >
                    {favoriteSet.has(
                      viewerPhoto.id
                    )
                      ? "♥ Favorited"
                      : "♡ Favorite"}
                  </button>

                  {event.allowPhotoSharing && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        void sharePhoto(
                          viewerPhoto
                        )
                      }
                    >
                      📤 Share Photo
                    </button>
                  )}

                  {event.allowPhotoSharing && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        void openPhotoQr(
                          viewerPhoto
                        )
                      }
                    >
                      ▦ QR
                    </button>
                  )}

                  {event.allowOptimizedDownload && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        void downloadPhoto(
                          viewerPhoto
                        )
                      }
                    >
                      ⬇ Download
                    </button>
                  )}

                  <button
                    type="button"
                    className={
                      slideshowActive
                        ? "btn btn-primary"
                        : "btn btn-ghost"
                    }
                    onClick={() => {
                      if (slideshowActive) {
                        stopSlideshow();
                      } else {
                        setSlideshowActive(
                          true
                        );
                      }
                    }}
                  >
                    {slideshowActive
                      ? "⏸ Pause"
                      : "▶ Play"}
                  </button>
                </div>
              </div>

              {photos.length >
                1 && (
                <button
                  type="button"
                  onClick={
                    nextPhoto
                  }
                  className="btn btn-ghost"
                  aria-label="Next photo"
                  style={{
                    position:
                      "absolute",
                    right: 18,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    zIndex: 10,
                    fontSize: 26,
                  }}
                >
                  ›
                </button>
              )}
            </div>
          )}

        {photos.length > 0 && (
          <div
            className="toolbar glass gold"
            style={{
              position: "fixed",
              left: "50%",
              transform:
                "translateX(-50%)",
              bottom: 18,
              zIndex: 1000,
              display: "flex",
              flexWrap: "wrap",
              justifyContent:
                "center",
              gap: 8,
              maxWidth:
                "calc(100vw - 24px)",
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              onClick={selectAll}
            >
              Select All
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              disabled={!count}
              onClick={() =>
                setSelected([])
              }
            >
              Clear ({count})
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              disabled={!count}
              onClick={() =>
                setShowAlbumSelection(
                  true
                )
              }
            >
              📖 Album Selection
              {count
                ? ` (${count})`
                : ""}
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              disabled={
                visiblePhotos.length === 0
              }
              onClick={
                startSlideshow
              }
            >
              ▶ Slideshow
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setShowGalleryInfo(true)
              }
            >
              Gallery Info
            </button>

            {event.allowGallerySharing && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  void copyGalleryLink()
                }
              >
                🔗 Copy Link
              </button>
            )}

            {event.allowGallerySharing && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={
                  openGalleryQr
                }
              >
                ▦ QR Code
              </button>
            )}

            {event.allowGallerySharing && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={
                  shareGallery
                }
              >
                Share Gallery
              </button>
            )}

            {event.allowPhotoSharing && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!count}
                onClick={
                  shareSelected
                }
              >
                Share Selected
                {count
                  ? ` (${count})`
                  : ""}
              </button>
            )}
          </div>
        )}

        {/* QR SHARING */}

        {showQr && qrUrl && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="QR sharing"
            onClick={() =>
              setShowQr(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 6000,
              background:
                "rgba(0,0,0,.86)",
              backdropFilter:
                "blur(18px)",
              display: "grid",
              placeItems: "center",
              padding: 20,
            }}
          >
            <div
              className="glass gold card"
              onClick={(event) =>
                event.stopPropagation()
              }
              style={{
                width:
                  "min(520px, 100%)",
                maxHeight:
                  "calc(100vh - 40px)",
                overflowY: "auto",
                padding: 24,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  gap: 12,
                  marginBottom: 18,
                  textAlign: "left",
                }}
              >
                <div>
                  <p
                    className="gold-text"
                    style={{
                      marginBottom: 6,
                    }}
                  >
                    QR Sharing
                  </p>

                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    {qrTitle ||
                      "Share Link"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setShowQr(false)
                  }
                >
                  ✕ Close
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  background: "#fff",
                  borderRadius: 18,
                  padding: 16,
                  margin:
                    "0 auto 16px",
                  width:
                    "min(340px, 100%)",
                }}
              >
                <img
                  src={`/api/gallery/qr?url=${encodeURIComponent(
                    qrUrl
                  )}`}
                  alt={`QR code for ${
                    qrTitle ||
                    "shared link"
                  }`}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>

              <div
                className="glass"
                style={{
                  padding: 12,
                  borderRadius: 14,
                  marginBottom: 16,
                  textAlign: "left",
                  overflowWrap:
                    "anywhere",
                }}
              >
                <small className="muted">
                  Share Link
                </small>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                  }}
                >
                  {qrUrl}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    void copyQrLink()
                  }
                >
                  🔗 Copy Link
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setShowQr(false)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ALBUM SELECTION */}

        {showAlbumSelection && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Submit album selection"
            onClick={() => {
              if (!albumSubmitting) {
                setShowAlbumSelection(
                  false
                );
              }
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 4600,
              background:
                "rgba(0,0,0,.82)",
              backdropFilter:
                "blur(16px)",
              display: "grid",
              placeItems: "center",
              padding: 20,
            }}
          >
            <div
              className="glass gold card"
              onClick={(event) =>
                event.stopPropagation()
              }
              style={{
                width:
                  "min(620px, 100%)",
                maxHeight:
                  "calc(100vh - 40px)",
                overflowY: "auto",
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <p
                    className="gold-text"
                    style={{
                      marginBottom: 6,
                    }}
                  >
                    Album Selection
                  </p>

                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    Submit Selected Photos
                  </h2>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={
                    albumSubmitting
                  }
                  onClick={() =>
                    setShowAlbumSelection(
                      false
                    )
                  }
                >
                  ✕ Close
                </button>
              </div>

              <div
                className="glass"
                style={{
                  padding: 14,
                  marginBottom: 14,
                }}
              >
                <strong>
                  {selected.length}
                </strong>{" "}
                <span className="muted">
                  photo
                  {selected.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected for album
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <label
                  style={{
                    display: "grid",
                    gap: 7,
                  }}
                >
                  <span>
                    Client Name
                  </span>

                  <input
                    type="text"
                    value={
                      albumClientName
                    }
                    disabled={
                      albumSubmitting
                    }
                    maxLength={120}
                    autoComplete="name"
                    onChange={(event) =>
                      setAlbumClientName(
                        event.target.value
                      )
                    }
                    placeholder="Enter client name"
                    className="glass"
                    style={{
                      width: "100%",
                      minHeight: 46,
                      border:
                        "1px solid rgba(255,255,255,.14)",
                      borderRadius: 12,
                      padding:
                        "10px 12px",
                      color: "inherit",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "grid",
                    gap: 7,
                  }}
                >
                  <span>
                    Phone Number
                  </span>

                  <input
                    type="tel"
                    value={
                      albumPhone
                    }
                    disabled={
                      albumSubmitting
                    }
                    maxLength={20}
                    autoComplete="tel"
                    inputMode="tel"
                    onChange={(event) =>
                      setAlbumPhone(
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    className="glass"
                    style={{
                      width: "100%",
                      minHeight: 46,
                      border:
                        "1px solid rgba(255,255,255,.14)",
                      borderRadius: 12,
                      padding:
                        "10px 12px",
                      color: "inherit",
                    }}
                  />
                </label>
              </div>

              <p
                className="muted"
                style={{
                  marginTop: 14,
                  marginBottom: 18,
                }}
              >
                After submission, this
                selection will be sent
                to the studio for album
                processing.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={
                    albumSubmitting
                  }
                  onClick={() =>
                    setShowAlbumSelection(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    albumSubmitting ||
                    selected.length === 0
                  }
                  onClick={() =>
                    void submitAlbumSelection()
                  }
                >
                  {albumSubmitting
                    ? "Submitting..."
                    : `Submit ${
                        selected.length
                      } Photo${
                        selected.length !==
                        1
                          ? "s"
                          : ""
                      }`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GALLERY INFO */}

        {showGalleryInfo && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Gallery information"
            onClick={() =>
              setShowGalleryInfo(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 4500,
              background:
                "rgba(0,0,0,.78)",
              backdropFilter:
                "blur(16px)",
              display: "grid",
              placeItems: "center",
              padding: 20,
            }}
          >
            <div
              className="glass gold card"
              onClick={(event) =>
                event.stopPropagation()
              }
              style={{
                width:
                  "min(680px, 100%)",
                maxHeight:
                  "calc(100vh - 40px)",
                overflowY: "auto",
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <p
                    className="gold-text"
                    style={{
                      marginBottom: 6,
                    }}
                  >
                    Gallery Information
                  </p>

                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    {event.eventName}
                  </h2>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setShowGalleryInfo(
                      false
                    )
                  }
                >
                  ✕ Close
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                {event.eventCode && (
                  <div
                    className="glass"
                    style={{
                      padding: 14,
                    }}
                  >
                    <small className="muted">
                      Event Code
                    </small>
                    <div>
                      {event.eventCode}
                    </div>
                  </div>
                )}

                {event.eventType && (
                  <div
                    className="glass"
                    style={{
                      padding: 14,
                    }}
                  >
                    <small className="muted">
                      Event Type
                    </small>
                    <div>
                      {event.eventType}
                    </div>
                  </div>
                )}

                {event.brideName && (
                  <div
                    className="glass"
                    style={{
                      padding: 14,
                    }}
                  >
                    <small className="muted">
                      Bride
                    </small>
                    <div>
                      {event.brideName}
                    </div>
                  </div>
                )}

                {event.groomName && (
                  <div
                    className="glass"
                    style={{
                      padding: 14,
                    }}
                  >
                    <small className="muted">
                      Groom
                    </small>
                    <div>
                      {event.groomName}
                    </div>
                  </div>
                )}

                {event.clientName && (
                  <div
                    className="glass"
                    style={{
                      padding: 14,
                    }}
                  >
                    <small className="muted">
                      Client
                    </small>
                    <div>
                      {event.clientName}
                    </div>
                  </div>
                )}

                {event.eventDate && (
                  <div
                    className="glass"
                    style={{
                      padding: 14,
                    }}
                  >
                    <small className="muted">
                      Event Date
                    </small>
                    <div>
                      {new Date(
                        event.eventDate
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>
                )}

                {event.location && (
                  <div
                    className="glass"
                    style={{
                      padding: 14,
                    }}
                  >
                    <small className="muted">
                      Location
                    </small>
                    <div>
                      {event.location}
                    </div>
                  </div>
                )}

                <div
                  className="glass"
                  style={{
                    padding: 14,
                  }}
                >
                  <small className="muted">
                    Photos
                  </small>
                  <div>
                    {photos.length}
                  </div>
                </div>

                <div
                  className="glass"
                  style={{
                    padding: 14,
                  }}
                >
                  <small className="muted">
                    Favorites
                  </small>
                  <div>
                    {favorites.length}
                  </div>
                </div>

                <div
                  className="glass"
                  style={{
                    padding: 14,
                  }}
                >
                  <small className="muted">
                    Selected
                  </small>
                  <div>{count}</div>
                </div>

                <div
                  className="glass"
                  style={{
                    padding: 14,
                  }}
                >
                  <small className="muted">
                    Album Selection
                  </small>
                  <div>
                    {count > 0
                      ? `${count} ready`
                      : "None selected"}
                  </div>
                </div>

                <div
                  className="glass"
                  style={{
                    padding: 14,
                  }}
                >
                  <small className="muted">
                    Slideshow
                  </small>
                  <div>
                    {slideshowActive
                      ? "Playing"
                      : "Paused"}
                  </div>
                </div>

                <div
                  className="glass"
                  style={{
                    padding: 14,
                  }}
                >
                  <small className="muted">
                    Photo Sharing
                  </small>
                  <div>
                    {event.allowPhotoSharing
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                </div>

                <div
                  className="glass"
                  style={{
                    padding: 14,
                  }}
                >
                  <small className="muted">
                    Gallery QR
                  </small>
                  <div>
                    {event.allowGallerySharing
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                </div>

                <div
                  className="glass"
                  style={{
                    padding: 14,
                  }}
                >
                  <small className="muted">
                    Photo Download
                  </small>
                  <div>
                    {event.allowOptimizedDownload
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                </div>
              </div>

              {event.description && (
                <div
                  className="glass"
                  style={{
                    padding: 16,
                    marginTop: 14,
                  }}
                >
                  <small className="muted">
                    Description
                  </small>

                  <p
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {message && (
          <div
            className="glass gold card"
            style={{
              position: "fixed",
              right: 18,
              bottom: 100,
              zIndex: 1100,
              padding:
                "12px 16px",
              maxWidth: 340,
            }}
          >
            <small>
              {message}
            </small>
          </div>
        )}
      </div>
    </main>
  );
}
