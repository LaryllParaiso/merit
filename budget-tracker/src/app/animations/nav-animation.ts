import { createAnimation } from '@ionic/angular';

export const appNavAnimation = (baseEl: any, opts?: any) => {
  const enteringEl = opts?.enteringEl;
  const leavingEl = opts?.leavingEl;

  const rootTransition = createAnimation();
  rootTransition.duration(360);
  rootTransition.easing('cubic-bezier(0.22, 0.88, 0.2, 1)');

  if (!enteringEl) {
    return rootTransition;
  }

  const enterTransition = createAnimation()
    .addElement(enteringEl)
    .beforeRemoveClass('ion-page-invisible')
    .fromTo('opacity', 0.01, 1)
    .fromTo('transform', 'translateX(18px)', 'translateX(0px)');

  const animations = [enterTransition];

  if (leavingEl) {
    const leaveTransition = createAnimation()
      .addElement(leavingEl)
      .fromTo('opacity', 1, 0.01)
      .fromTo('transform', 'translateX(0px)', 'translateX(-12px)');

    animations.push(leaveTransition);
  }

  rootTransition.addAnimation(animations);
  return rootTransition;
};
