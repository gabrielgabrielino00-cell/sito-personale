import Logo from "@/components/brand/Logo";
import LoadingScreenController from "@/components/LoadingScreenController";
import { LOADING_SCREEN_STYLE } from "@/lib/loadingScreenInline";

export default function LoadingScreen() {
  return (
    <>
      <style
        id="ls-styles"
        dangerouslySetInnerHTML={{ __html: LOADING_SCREEN_STYLE }}
      />
      <div
        id="ls-overlay"
        role="status"
        aria-live="polite"
        aria-label="Caricamento in corso"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <div className="ls-content">
          <div className="ls-logo-wrap">
            <Logo size="xl" className="ls-logo" />
          </div>

          <div className="ls-progress-wrap">
            <div className="ls-progress-track" aria-hidden="true">
              <div className="ls-progress-fill" id="ls-progress-fill" />
            </div>
            <span className="ls-progress-label" id="ls-progress-label">
              0
            </span>
          </div>
        </div>
      </div>
      <LoadingScreenController />
    </>
  );
}